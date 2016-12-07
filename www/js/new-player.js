module.factory('msPlayer', function($interval, $q, $cordovaFileTransfer, musicService, setlistService, auth, msCordovaPluginPlayer){

	var jaCarregou = false;

	var ANALIZER_NODE_BUFFER_SIZE = 1000;

	var STATUS_UNAVAILABLE = {id : -1, isPlayerInConsistentStatus : false, isPlaying : false, isPaused : false, isDownloading : false};
	var STATUS_INITIAL = {id : 0, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : false};
	var STATUS_PAUSED = {id : 1, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : true, isDownloading : false};
	var STATUS_PLAYING = {id : 2, isPlayerInConsistentStatus : true, isPlaying : true, isPaused : false, isDownloading : false};
	var STATUS_DOWNLOADING = {id : 3, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : true};

	var EVENT_START_PLAYING = {id : 1, newStatus : STATUS_PLAYING};
	var EVENT_TARCKS_LOADED = {id : 2, newStatus : STATUS_INITIAL};
	var EVENT_SOUND_STOPS = {id : 3, newStatus : STATUS_INITIAL};
	var EVENT_START_DOWNLOADING_TRACKS = {id : 4, newStatus : STATUS_DOWNLOADING};
	var EVENT_DOWNLOAD_FAILED = {id : 5, newStatus : STATUS_UNAVAILABLE};
	var EVENT_SUSPENDING = {id : 6, newStatus : STATUS_PAUSED};

	var LOG_LEVEL_DEBUG_DETAILS = 4;
	var LOG_LEVEL_DEBUG = 3;
	var LOG_LEVEL_INFO = 2;
	var LOG_LEVEL_ERROR = 1;

	var INTERVAL_MENSSAGE = 2000;
	var INTERVAL_CHECK_GENERAL_STATUS = 500;

	var INTERVAL_LED_CALCULATION_IN_MILLIS = 100;

	var log = function(level, message, caller, args){

		var logLevelAsString = ["ERROR", "INFO", "DEBUG", "DEBUG_DETAILS"];

		if (player.logLevel <= level){
			console.log("[" + caller + "] - " + logLevelAsString[level-1] + ": " + message);
			if (args){
				console.log(args);
			}
		}

	}

	// Objeto com informacoes a serem expostas pelo servico que sao uteis para leitura de status
	var player = {status : STATUS_INITIAL, 
				  fileSystem : null, 
				  setlist : {musics : null, 
				  			 name : '', 
				  			 id: -1,
				  			 timeToNext : -1,
				  			 nextMusic : ''}, 
				  currentMusic : null, 
				  handleEvent : handleEvent,
				  logLevel : LOG_LEVEL_DEBUG, 
				  log : log,
				  sound : null,
				  isAnApp : false,
				  masterPan : 0,
				  masterLevel : 0.8,
				  currentTimeAsString : '',
				  message : '',
				  showMessage : false,
				  messageInterval : null,
				  playerSlideInterval : null,
				  checkStatusSoundInterval : null,
				  currentTime : 0,
				  lastMainDecibels : 128,
				  analyserNodeMaster : null,
				  calculateLedsInterval : null,
				  currentMusicWasSuccessfullyDownloaded : false,
				  mainLeds : {left : null, right : null}};

	/**
	* Trata alteracao entre os status do player
	*/
	var handleEvent = function(event){

		player.log(LOG_LEVEL_DEBUG, "Event received.", "handleEvent", event);


		if (!event.type.newStatus.isPlaying){

       		$interval.cancel(player.playerSlideInterval);
       		$interval.cancel(player.calculateLedsInterval);

       		if (!event.type.newStatus.isDownloading && event.type.newStatus.isPlayerInConsistentStatus){

	       		$interval.cancel(player.calculateLedsInterval);

				player.mainLeds.left = "img/level-led-0.png";
				player.mainLeds.right = "img/level-led-0.png";

				player.currentMusic.tracks.forEach(function (entry){
					entry.leds.left = "img/level-led-0.png";
					entry.leds.right = "img/level-led-0.png";
				});

				player.setlist.timeToNext = -1;
				player.setlist.nextMusic = null;

       		}

   		}


		if (!event.type.newStatus.isPlaying && !event.type.newStatus.isPaused){
       		player.currentTimeAsString = "0:00";
       		player.currentTime = 0;
       		player.downloadProgress = 0;
       		player.currentMusicWasSuccessfullyDownloaded = false;
		}

		if (event.type.newStatus.isPlaying){

			player.calculateLedsInterval = $interval(function(){
				calculateLeds();
			}, INTERVAL_LED_CALCULATION_IN_MILLIS);

			player.playerSlideInterval = $interval(function(){
				player.currentTime++;
				calculateTimeAsString();
				checkStatusSound();
			}, 1000);

		}

		player.status = event.type.newStatus;	

		// Se o evento for sound ended em uma selits e ainda existem musicas a serem tocadas, carrega a proxima
		if (event.type.id == 3){

			if (player.setlist != null && player.setlist.musics != null && getIndexOfCurrentMusicInSetlist() + 1 < player.setlist.musics.length){
				getMusicDetail(player.setlist.musics[getIndexOfCurrentMusicInSetlist()+1].musicId, function(){

				});
			}

		}

		// Se as trilhlas acabaram de carregar, verifica se precisa iniciar a tocar imediatamente
		if (event.type.id == 2){

			if (player.setlist != null && player.setlist.musics != null && player.setlist.musics.length > 0 && player.setlist.musics[getIndexOfCurrentMusicInSetlist()].inicio == 0){
				_play();
			}

		}

	}

	var checkStatusSound = function(){


		msCordovaPluginPlayer.playing(
			function(response){
				if(response.status != 1){ // NOT PLAYING
					handleEvent({type : EVENT_SOUND_STOPS, caller : 'checkStatusSound', success : true, obj : null});
				}
			}, function(error){
				// @TODO TRATAR QUANDO NAO EH POSSIVEL CAPTURAR O STATUS DO PLAYER. POR ENQUANTO ESTA PARANDO
				handleEvent({type : EVENT_SOUND_STOPS, caller : 'checkStatusSound', success : true, obj : null});
			}
		);
/*
		if (!msCordovaPluginPlayer.playing()){
			handleEvent({type : EVENT_SOUND_STOPS, caller : 'checkStatusSound', success : true, obj : null});
		}
*/
		if (player.currentMusic.calculatedTotalTime - player.currentTime == 2 && player.currentMusic.status != 1){
			player.currentMusic.tracks.forEach(function (entry){
				msCordovaPluginPlayer.fade(entry.level * player.masterLevel, 0, 2000, entry.id);
			});
		}

		if (player.setlist != null && player.setlist.musics != null && player.setlist.musics.length > 0 && getIndexOfCurrentMusicInSetlist() + 1 < player.setlist.musics.length){
			if (player.currentMusic.calculatedTotalTime - player.currentTime < 10){
				player.setlist.timeToNext = player.currentMusic.totalTimeInSeconds - player.currentTime;
				player.setlist.nextMusic = player.setlist.musics[getIndexOfCurrentMusicInSetlist()+1].musicName;
			}
		}

	}

	var getIndexOfCurrentMusicInSetlist = function(){

		var idx = 0;
		var result = -1;

		player.setlist.musics.forEach(function(entry){

			if (player.currentMusic.musicId == entry.musicId){
				result = idx;
			}

			idx++;

		})

		return result;

	}

	var calculateTimeAsString = function(){

		var minutes = Math.floor((player.currentTime) / 60);
		var seconds = player.currentTime - minutes * 60;

		if ((seconds + "").length == 1){
			seconds = "0" + seconds;
		}

		player.currentTimeAsString = minutes + ":" + seconds;

	};

	/**
	* Delegate para Servico de Setlist para captura de detalhes de uma setlist
	*/
	var getSetlistDetail = function(setlistId, callback){

			var promisses;

			promisses = [];

			promisses.push(setlistService.getSetlistDetail(auth.token, setlistId));

			$q.all(promisses).then(

	            function(response) { 

	            	player.log(LOG_LEVEL_DEBUG, "Setlist successfully read.", "getSetlistDetail", response[0]);

	            	callback(response[0]);

	            },

	            function(response) { 

	            	player.log(LOG_LEVEL_ERROR, "ERROR WHILE LOADING SETLIST." , "getSetlistDetail", response[0]);

	            	callback(response[0]);

	            }

	        ).finally(function() {

	        });



	}


	/**
	* Delegate para Servico de Musica para captura de detalhes de uma musica
	*/
	var getMusicDetail = function(musicId, callback){

		var promisses;

		promisses = [];

		promisses.push(musicService.getMusicDetails(auth.token, musicId));

		$q.all(promisses).then(

            function(response) { 

        		player.currentMusic = response[0].bean;

            	if (response[0].bean.status != 1){
            		player.currentMusic.calculatedTotalTime = 29;
            	}else{
		        	player.currentMusic.calculatedTotalTime = parseInt(player.currentMusic.totalTimeInSeconds) - 1;
            	}


		 		player.currentMusic.tracks.forEach(function(entry) {

					entry.leds = {left : null, right : null};
					entry.lastDecibels = 128;

        		});

    			loadCurrentMusicTracks();

            	callback(response[0]);

            },

            function(response) { 

            	player.log(LOG_LEVEL_ERROR, "ERROR WHILE LOADING MUSIC DETAIL.", "getMusicDetails", response[0]);

            	callback(response[0]);

            }

        ).finally(function() {

        });


	};

	var loadCurrentMusicTracks = function(){

		var urls = [];
        var fileUris = [];
        var ms_hostname;
        var uri;
        var failToLoadFromLocal;

        ms_hostname = window.localStorage.getItem("environment");

        failToLoadFromLocal = false;

        // Prepara URLs de leitura das tracks
		player.currentMusic.tracks.forEach(function (entry){

			if (player.fileSystem != null){
	            uri = {uri : player.fileSystem + entry.id + ".atom" ,
                       id : entry.id,
                       isMute : false,
                       isSolo : false,
                       level : 1,
                       pan : 0};

				fileUris.push(uri);

			}else{
				failToLoadFromLocal = true;
			}

            uri = {uri : ms_hostname + "/MultiSongs/api/download/music/wav/" + auth.token + "/" + entry.id , //+ "/" + (player.currentMusic.status != 1),
                   id : entry.id,
                   isMute : false,
                   isSolo : false,
                   level : 1,
                   pan : 0};

			urls.push(uri);

		});

		msCordovaPluginPlayer.createPlugin((player.currentMusic.status != 1), 44100, 16, 2, fileUris, player.fileSystem, 
			function(message){
				console.log("CARREGOU DO ARQUIVO");
	        	handleEvent({type : EVENT_TARCKS_LOADED, caller : 'loadCurrentMusicTracks', success : true, obj : null});
			},
			function(err){
				console.log("Nao carergou do arquivo. Vai tentar da URL");
				msCordovaPluginPlayer.createPlugin((player.currentMusic.status != 1), 44100, 16, 2, urls, player.fileSystem, 
					function(message){
console.log("Carregou das URLs");
						player.log(LOG_LEVEL_DEBUG_DETAILS, "Songs downloaded", "play");
			        	handleEvent({type : EVENT_TARCKS_LOADED, caller : 'loadCurrentMusicTracks', success : true, obj : null});
					},
					function(err){
console.log("ERROR! " + err);
					}
				);
			}
		);

	};

	/**
	* Carrega as trilhas da musica corrente
	*/
	/*
	var loadCurrentMusicTracks = function(){

		var songs = [];
        var fileUris = [];
        var ms_hostname;
        var url;
        var failToLoadFromLocal;

        ms_hostname = window.localStorage.getItem("environment");

        failToLoadFromLocal = false;

        // Prepara URLs de leitura das tracks
		player.currentMusic.tracks.forEach(function (entry){

			if (player.fileSystem != null){
				fileUris.push(player.fileSystem + entry.id + ".atom");
			}else{
				failToLoadFromLocal = true;
			}

	        url = ms_hostname + "/MultiSongs/api/download/music/" + auth.token + "/" + entry.id + "/" + (player.currentMusic.status != 1);
			songs.push(url);

		});

		// Tenta carregar do filesystem local, caso exista filesystem
		
		if (player.fileSystem != null){
			player.log(LOG_LEVEL_DEBUG_DETAILS, "Vai tentar carregar as musicas so filesystem local. Uris: " + fileUris, "play");
			
			player.sound = new Howl({
				src: fileUris,
				format : ['ogg'],
				onloaderror : function(id, error){

					player.sound.unload();

					// Carrega as musicas das urls , caso nao tenha conseguido carregar local
					player.log(LOG_LEVEL_DEBUG_DETAILS, "Vai realizar download remoto. Urls de musicas a serem carregadas: " + url, "play");
					player.sound = new Howl({
						src: songs,
						format : ['ogg']
					});

				}

			});
			
		}

		player.log(LOG_LEVEL_DEBUG_DETAILS, "state: " + player.sound.state(), "");

		// Monitora o status de download do sound e altera status do player quando download finalizado
		player.checkStatusSoundInterval = $interval(function(){

			if (player.sound.state() == "loaded"){

				player.log(LOG_LEVEL_DEBUG_DETAILS, "Songs downloaded", "play");

				$interval.cancel(player.checkStatusSoundInterval);

            	// Dispara evento de STATUS_INICIAL do player apos a carga com sucesso da playlist
	        	handleEvent({type : EVENT_TARCKS_LOADED, caller : 'loadCurrentMusicTracks', success : true, obj : null});

			}

		}, INTERVAL_CHECK_GENERAL_STATUS);

	};
	*/

	var calculateLedscounter = 0;

	var calculateLeds = function(){


		msCordovaPluginPlayer.getDecibels(calculateLedscounter * INTERVAL_LED_CALCULATION_IN_MILLIS, 
			function(result){
				console.log(result);
			}, 
			function(error){

			}
		);

		calculateLedscounter++;

	};

/*
		var ledIdx;

		player.lastMainDecibels = getDecibels(player.analyserNodeMaster, player.lastMainDecibels);

		ledIdx = Math.floor((player.lastMainDecibels - 128)/ 4);

		if (ledIdx > 13){
			ledIdx = 13;
		}

		if (ledIdx < 0){
			ledIdx = 0;
		}

		player.mainLeds.left = "img/level-led-" + ledIdx + ".png";
		player.mainLeds.right = "img/level-led-" + ledIdx + ".png";

		player.currentMusic.tracks.forEach(function (entry){

			if (entry.enabled){

				entry.lastDecibels = getDecibels(entry.analyserNode, entry.lastDecibels);
				
				ledIdx = Math.floor((entry.lastDecibels - 128)/ 4);

				if (ledIdx > 13){
					ledIdx = 13;
				}

				if (ledIdx < 0){
					ledIdx = 0;
				}

			} else {
				ledIdx = 0;
			}
			

			entry.leds.left = "img/level-led-" + ledIdx + ".png";
			entry.leds.right = "img/level-led-" + ledIdx + ".png";

		});

	};

	var getDecibels = function(analyser, lastDecibels){


		var dataArray = new Uint8Array(ANALIZER_NODE_BUFFER_SIZE);

		analyser.getByteTimeDomainData(dataArray);

		if (lastDecibels == 128) {

			lastDecibels = Math.max.apply(null, dataArray);

		} else {

			if  (lastDecibels > Math.max.apply(null, dataArray)){
				lastDecibels = lastDecibels - 1;
			}

			if (lastDecibels < Math.max.apply(null, dataArray)) {
				lastDecibels = Math.max.apply(null, dataArray);
			}

		};

		return lastDecibels;

	};
*/
	var _play = function(){

		var analyser;

		msCordovaPluginPlayer.play();

		/*

			player.analyserNodeMaster = Howler.ctx.createAnalyser();

			// Inicializa os sons e guarda os soundIds gerados pelo player
			player.currentMusic.tracks.forEach(function (entry){

				analyser = Howler.ctx.createAnalyser();

				entry.soundId = player.sound.play();

				player.sound._soundById(entry.soundId)._node.connect(analyser);

				analyser.connect(player.analyserNodeMaster);

				entry.analyserNode = analyser;

				player.sound.volume(entry.level * player.masterLevel * 0.3, entry.soundId);

			});

			player.analyserNodeMaster.connect(Howler.ctx.destination);
*/


			if (player.currentMusic.status != 1){

				player.currentMusic.tracks.forEach(function (entry){
					msCordovaPluginPlayer.fade(0, entry.level * player.masterLevel, 2000, entry.id);
				});

			}

   	  		handleEvent({type : EVENT_START_PLAYING, caller : 'play', success : true, obj : null});

	}


	return {

		STATUS_UNAVAILABLE : STATUS_UNAVAILABLE,
		STATUS_INITIAL : STATUS_INITIAL,
		STATUS_PLAYING : STATUS_PLAYING,
		STATUS_PAUSED : STATUS_PAUSED,


		/**
		* Retorna o objeto player
		*/
		getPlayer : function(){
			return player;
		},

		/**
		* Configura o fileSystem a ser utilizado pelo player
		*/
		setFileSystem : function(fileSystem){

            player.fileSystem = fileSystem;

		},

		/**
		* Carrega uma setlist para o player
		*/
		loadSetlist: function(setlistId){

      		handleEvent({type : EVENT_START_DOWNLOADING_TRACKS, caller : 'loadSetlist', success : true, obj : setlistId});

			getSetlistDetail(setlistId, function(response){

				if (response.success == true){

	            	// Carrega detalhes da setlist no objeto player
	            	player.setlist.musics = response.musics;
	            	player.setlist.name = response.title;
	            	player.setlist.id = response.id;

	            	// Carrega detalhe da musica atual (primeira) da setlist
	            	getMusicDetail(player.setlist.musics[0].musicId, function(response){

	            		if (response.success){
		            		
       		            	player.log(LOG_LEVEL_ERROR, "Setlist detail successfully read.", "loadSetlist", response);

	            		}else{

	            			player.log(LOG_LEVEL_ERROR, "Setlist detail NOT read.", "loadSetlist", response);

	            			// @TODO: Mensagem para usuario - Primeira musica da playlist nao carregada com sucesso

	            			// Dispara evento de STATUS_INICIAL do player apos a carga com sucesso da playlist
    	        			handleEvent({type : EVENT_DOWNLOAD_FAILED, caller : 'loadSetlist', success : false, obj : setlistId});

	            		}

	            	});

				} else {

	            	player.log(LOG_LEVEL_ERROR, "ERROR WHILE LOADING SETLIST.", "loadSetlist", response);

	            	handleEvent({type : EVENT_DOWNLOAD_FAILED, caller : 'loadSetlist', success : false});

				}

			});

		},

		/**
		* Carrega uma unica musica para o player
		*/
		loadMusic: function(musicId){

      		handleEvent({type : EVENT_START_DOWNLOADING_TRACKS, caller : 'loadMusic', success : true, obj : musicId});

        	// Carrega detalhe da musica atual (primeira) da setlist
        	getMusicDetail(musicId, function(response){

        		if (response.success){

        			player.log(LOG_LEVEL_ERROR, "Music detail successfully read.", "loadMusic", response);

           		}else{

        			// @TODO: Mensagem para usuario - Musica nao carregada com sucesso

        			player.log(LOG_LEVEL_ERROR, "Music detail NOT read.", "loadMusic", response);

        			// Dispara evento de STATUS_INICIAL do player apos a carga com sucesso da playlist
    	        	handleEvent({type : EVENT_DOWNLOAD_FAILED, caller : 'loadMusic', success : false, obj : response});

        		}

        	});

		},

		/**
		* Muda o nivel de um determinado canal
		*/
		changeLevel: function($scope, track){

			msCordovaPluginPlayer.volume(track.level * player.masterLevel, track.id);

			track.message = parseInt(track.level * 100) + "%";
			track.showMessage = true;

			if (track.interval){
				$interval.cancel(track.interval);
			}

			track.interval = $interval(function(){track.showMessage = false}, INTERVAL_MENSSAGE, 1);

		},

		/**
		* Muda o nível do canal master
		*/
		changeMasterLevel: function($scope){

			player.currentMusic.tracks.forEach(function (entry){
				msCordovaPluginPlayer.volume(entry.level * player.masterLevel, entry.id);
			});

			player.message = parseInt(player.masterLevel * 100) + "%";
			player.showMessage = true;

			if (player.messageInterval){
				$interval.cancel(player.messageInterval);
			}

			player.messageInterval = $interval(function(){player.showMessage = false}, INTERVAL_MENSSAGE, 1);


		},

		/**
		* Muda o pan do canal master
		*/
		changeMasterPan: function($scope){

			msCordovaPluginPlayer.stereo(parseFloat(player.masterPan));
			player.message = Math.abs(parseInt(player.masterPan * 100)) + ((player.masterPan > 0)?"R":"L");
			player.showMessage = true;

			if (player.messageInterval){
				$interval.cancel(player.messageInterval);
			}

			player.messageInterval = $interval(function(){player.showMessage = false}, INTERVAL_MENSSAGE, 1);

		},

		/**
		* Muda o pan de um determinado canal
		*/
		changePan: function($scope, track){

			msCordovaPluginPlayer.stereo(parseFloat(track.pan), track.id);
			track.message = Math.abs(parseInt(track.pan * 100)) + ((track.pan > 0)?"R":"L");
			track.showMessage = true;

			if (track.interval){
				$interval.cancel(track.interval);
			}

			track.interval = $interval(function(){track.showMessage = false}, INTERVAL_MENSSAGE, 1);

		},

		/**
		* Desativa o solo de uma determinada trilha
		*/
		unactivateSolo: function($scope, track){

			msCordovaPluginPlayer.unsolo(track.id);

		},

		/**
		* Ativa o solo de uma determinada trilha
		*/
		activateSolo: function($scope, track){

			msCordovaPluginPlayer.solo(track.id);

		},

		/**
		* Ativa o mute de uma determinada trilha
		*/
		mute: function($scope, track){

			msCordovaPluginPlayer.mute(true, track.id);

			track.enabled = false;

			track.message = "OFF";
			track.showMessage = true;

			if (track.interval){
				$interval.cancel(track.interval);
			}

			track.interval = $interval(function(){track.showMessage = false}, INTERVAL_MENSSAGE, 1);

			player.log(LOG_LEVEL_DEBUG_DETAILS, "Track mutted: " + track.id, "mute");

		},

		/**
		* Desativa o mute de um determinado canal
		*/
		unMute: function($scope, track){

			msCordovaPluginPlayer.mute(false, track.id);

			track.enabled = true;

			track.message = "ON";
			track.showMessage = true;

			if (track.interval){
				$interval.cancel(track.interval);
			}

			track.interval = $interval(function(){track.showMessage = false}, INTERVAL_MENSSAGE, 1);

			player.log(LOG_LEVEL_DEBUG_DETAILS, "Track unmutted: " + track.id, "unMute");

		},

		/**
		* Inicia a musica
		*/
		play: function(){

			_play();

		},

		new: function($scope){

		},

		stop: function(){

			msCordovaPluginPlayer.unload();

		},

		unloadSetlist : function(){

			msCordovaPluginPlayer.unload();


			player.setlist = {musics : null, 
				  			 name : '', 
				  			 id: -1,
				  			 timeToNext : -1,
				  			 nextMusic : ''};

		},

		resume: function(){

			msCordovaPluginPlayer.play();

			/*

			player.currentMusic.tracks.forEach(function (entry){
				msCordovaPluginPlayer.seek(parseInt(player.currentTime), entry.id);
			});

			*/

			calculateTimeAsString();

			handleEvent({type : EVENT_START_PLAYING, caller : 'resume', success : true});

		},

		suspend: function($scope){

			msCordovaPluginPlayer.pause();

			handleEvent({type : EVENT_SUSPENDING, caller : 'suspend', success : true});

		},


		download: function(){

			var url;
			var targetPath;

			player.currentMusic.status = 1;

			var ms_hostname = window.localStorage.getItem("environment");

			player.currentMusic.tracks.forEach(function (entry){

				url = ms_hostname + "/MultiSongs/api/download/music/" + token + "/" + entry.id + "/" + false;
				targetPath = player.fileSystem + entry.id + ".atom";

				$cordovaFileTransfer.download(url, targetPath, {}, true).
				then(function (result) {

					player.currentMusicWasSuccessfullyDownloaded = true;
					player.downloadProgress = 0;


				}, function (error) {

					player.currentMusicWasSuccessfullyDownloaded = false;
					player.downloadProgress = 0;

				}, function (progress) {

					entry.progress = parseInt((progress.loaded / progress.total) * 100);
					
					var pgrs = 0;

					player.currentMusic.tracks.forEach(function (entry2){
						pgrs += entry2.progress;
					});	

					player.downloadProgress = pgrs;

				});

			});

		},

		changePosition: function($scope){

			msCordovaPluginPlayer.seek(parseInt(player.currentTime), function(obj){
				console.log(obj);
        		if (player.currentTime != obj.position){
        			player.currentTime = obj.position;
        			calculateTimeAsString();
        		}
			});

			

		}

	}


});
