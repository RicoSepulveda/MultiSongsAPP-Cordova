module.factory('msPlayer', function($interval, $q, $cordovaFileTransfer, $ionicLoading, musicService, setlistService, auth, msCordovaPluginPlayer, configService){

	var calculateLedscounter = 0;

	var ANALIZER_NODE_BUFFER_SIZE = 1000;
/*
	var STATUS_UNAVAILABLE = {id : -1, isPlayerInConsistentStatus : false, isPlaying : false, isPaused : false, isDownloading : false, shouldMonitorStatusChange : false, shouldKeepMonitoringLeds : false};
	var STATUS_INITIAL = {id : 4, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : false, shouldMonitorStatusChange : false, shouldKeepMonitoringLeds : false};
	var STATUS_PAUSED = {id : 2, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : true, isDownloading : false, shouldMonitorStatusChange : false, shouldKeepMonitoringLeds : false};
	var STATUS_PLAYING = {id : 1, isPlayerInConsistentStatus : true, isPlaying : true, isPaused : false, isDownloading : false, shouldMonitorStatusChange : true, shouldKeepMonitoringLeds : true};
	var STATUS_BUFFERING = {id : 6, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : true, shouldMonitorStatusChange : true, shouldKeepMonitoringLeds : false};
	var STATUS_TRANSIENT_TO_PLAY = {id : 7, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : false, shouldMonitorStatusChange : true, shouldKeepMonitoringLeds : true};
*/

/**
 STATUS_UNLOADED: Loader esta indisponivel e deve ser configurado antes do uso
 STATUS_INICIAL : Loader ja foi configurado e esta pronto para comecar a ser iniciado
 STATUS_PLAYING: Loader esta atualmente tocando a musica que foi configurada anteriormente
 STATUS_PAUSED: Loader esta em pause
 STATUS_BUFFERING: Loader esta configurado porem nao conseguiu carregar os pacotes a tempo de evitar um underrun
 STATUS_LOADING: Status assumido pelo player enquanto esta configurando a musica. Utilizado no new-player.js para monitrar as mudancas de estado do player em java
 */

	var STATUS_UNLOADED = {id : -1, isPlayerInConsistentStatus : false, isPlaying : false, isPaused : false, isDownloading : false, shouldKeepMonitoringLeds : false};
	var STATUS_INITIAL = {id : 0, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : false, shouldKeepMonitoringLeds : false};
	var STATUS_PLAYING = {id : 1, isPlayerInConsistentStatus : true, isPlaying : true, isPaused : false, isDownloading : false, shouldKeepMonitoringLeds : true};
	var STATUS_PAUSED = {id : 2, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : true, isDownloading : false, shouldKeepMonitoringLeds : false};
	var STATUS_BUFFERING = {id : 3, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : true, shouldKeepMonitoringLeds : false};

	var EVENT_STARTED_PLAYING = {id : 1, newStatus : STATUS_PLAYING, shouldResetCounters : false};
	var EVENT_SEEKING = {id : 2, newStatus : STATUS_PAUSED, shouldResetCounters : false};
	var EVENT_TRACKS_LOADED = {id : 3, newStatus : STATUS_INITIAL, shouldResetCounters : true};
	var EVENT_SOUND_STOPPED = {id : 4, newStatus : STATUS_UNLOADED, shouldResetCounters : true};
	var EVENT_SEVERAL_ERROR = {id : 6, newStatus : STATUS_UNLOADED, shouldResetCounters : true};
	var EVENT_PAUSED = {id : 7, newStatus : STATUS_PAUSED, shouldResetCounters : false};
	var EVENT_BUFFERING = {id : 8, newStatus : STATUS_BUFFERING, shouldResetCounters : false};

	var TRACK_TYPE_INSTRUMENT = 1;
	var TRACK_TYPE_MIXED = 2;

	var LOG_LEVEL_DEBUG_DETAILS = 4;
	var LOG_LEVEL_DEBUG = 3;
	var LOG_LEVEL_INFO = 2;
	var LOG_LEVEL_ERROR = 1;

	var PLAYER_TYPE_NOT_DEFINED_YET = -1;
	var PLAYER_TYPE_MULTITRACK = 1;
	var PLAYER_TYPE_SINGLETRACK = 2;
	var PLAYER_TYPE_SINGLETRACK_LOCAL = 3;
	var PLAYER_TYPE_SETLIST = 4;

	var CIFRA_DELTA_TEMPO_MINIMO_ENTRE_ACORDE_FRASE = 250;
	var CIFRA_TROCAR_ACORDE = 1;
	var CIFRA_TROCAR_FRASE = 2;
	var CIFRA_TROCAR_FRASE_ACORDE = 3;


	var INTERVAL_MENSSAGE = 2000;
	var INTERVAL_CHECK_GENERAL_STATUS = 500;

	var INTERVAL_LED_CALCULATION_IN_MILLIS = 100;

	var spinner = '<ion-spinner icon="dots" class="spinner-stable"></ion-spinner><br/>';

	var log = function(level, message, caller, args){

		var logLevelAsString = ["ERROR", "INFO", "DEBUG", "DEBUG_DETAILS"];

		if (player.logLevel >= level){
			console.log("[" + caller + "] - " + logLevelAsString[level-1] + ": " + message);
			if (args){
				console.log(args);
			}
		}

	}

	// Objeto com informacoes a serem expostas pelo servico que sao uteis para leitura de status
	var player = {status : STATUS_UNLOADED, 
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
				  showCards : true,
				  sound : null,
				  isAnApp : false,
				  masterPan : 0,
				  masterLevel : 0.8,
				  type : 0,
				  currentTimeAsString : '',
				  musicBeenDownloaded : null,
				  message : '',
				  showMessage : false,
				  messageInterval : null,
				  playerSlideInterval : null,
				  //statusChangedInterval : null,
				  currentTime : 0,
				  lastMainDecibels : 128,
				  saveButtonEnabled : false,
				  analyserNodeMaster : null,
				  calculateLedsInterval : null,
				  changeLevelInterval : null,
				  seekInterval : null,
				  timestampNextChangeInLyrics : 0,
				  timestampWhenPauseWasPressed : 0,
				  bufferPercentage : 0,
				  lyticsChangedCallback : null,
				  chordCards : null,
				  currentMusicWasSuccessfullyDownloaded : false,
				  mainLeds : {left : null, right : null}};

	/**
	* Trata alteracao entre os status do player
	*/
	var handleEvent = function(event){

		player.log(LOG_LEVEL_DEBUG, "Event received.", "handleEvent", event);

		if (event.type.newStatus.shouldKeepMonitoringLeds == true){

			player.mainLeds.left = "img/level-led-0.png";
			player.mainLeds.right = "img/level-led-0.png";

			player.currentMusic.tracks.forEach(function (entry){
				entry.leds.left = "img/level-led-0.png";
				entry.leds.right = "img/level-led-0.png";
			});

		}


		if (event.type.newStatus.isPlaying == true){

			if (player.currentMusic.cifra && (player.currentMusic.cifra.fraseIdx > -1 || player.currentMusic.cifra.acordeIdx > -1)){

				handleCifra();
				
			}

			if (player.playerSlideInterval == null){
				player.playerSlideInterval = $interval(function(){
					player.currentTime++;
					calculateTimeAsString();
				}, 1000);
			}
		}else{
			$interval.cancel(player.playerSlideInterval);
			player.playerSlideInterval = null;
		}

		if (event.type.shouldResetCounters == true){

       		player.currentTimeAsString = "0:00";
       		player.currentTime = 0;
       		player.downloadProgress = 0;
       		player.currentMusicWasSuccessfullyDownloaded = false;
       		player.timestampNextChangeInLyrics = 0;
       		player.timestampWhenPauseWasPressed = 0;
	
			if (player.currentMusic != null && player.currentMusic.cifra !== undefined && player.currentMusic.cifra != null){

	   			calculateFirstFraseIdx();

				if (player.lyticsChangedCallback != null){
					player.lyticsChangedCallback(player.currentMusic.cifra.fraseIdx);
				}

			}

		}

		// Se o evento for sound ended em uma selits e ainda existem musicas a serem tocadas, carrega a proxima
		if (event.type.id == EVENT_SOUND_STOPPED.id){

			if (player.setlist != null && player.setlist.musics != null && getIndexOfCurrentMusicInSetlist() + 1 < player.setlist.musics.length){
				prepareMusicToBePlayed(player.setlist.musics[getIndexOfCurrentMusicInSetlist()+1].musicId, function(){}, player.setlist.musics[getIndexOfCurrentMusicInSetlist()+1].inicio == 0);
			} else {
				prepareMusicToBePlayed(player.currentMusic.music.musicId, function(){}, false);
			}

		}

		// Se as trilhlas acabaram de carregar, verifica se precisa iniciar a tocar imediatamente
		if (event.type.id == EVENT_TRACKS_LOADED.id){

			if (player.currentMusic.iniciaImediatamente){

            	player.log(LOG_LEVEL_DEBUG, "Musica sera iniciada automaticamente.", "handleEvent", null);

				//player.status = STATUS_TRANSIENT_TO_PLAY; // Garante que o player nao envie um evento startPlaying pelo checkStatusSound enquanto o player esta iniciando a execucao da musica...

				//player.currentMusic.iniciaImediatamente = false; // Para garantir que apos o fim da musica ela nao reinicia automaticamente novamente...

				_play();

				return;

			}else{
            	player.log(LOG_LEVEL_DEBUG, "Musica NAO sera iniciada automaticamente.", "handleEvent", null);
			}

		}

		player.status = event.type.newStatus;	

	}

	var handleCifra = function(){

		var onSuccessCallback = function(obj){

			player.log(LOG_LEVEL_DEBUG, "Atingiu o segundo para mudanca de frase... ", "handleCifra", null);

			player.currentMusic.cifra.fraseIdx++; 

			if (player.lyticsChangedCallback != null){
				player.lyticsChangedCallback(player.currentMusic.cifra.fraseIdx);
			}


			handleCifra();

		};

		if (player.currentMusic.cifra.fraseIdx > -1 && player.currentMusic.cifra.fraseIdx < player.currentMusic.cifra.fraseBeans.length - 1){

			msCordovaPluginPlayer.setMark(player.currentMusic.cifra.fraseBeans[player.currentMusic.cifra.fraseIdx+1].tempo, "", onSuccessCallback, function(obj){});

		}



	}

	var statusChanged = function(newStatus){

		player.log(LOG_LEVEL_DEBUG, "Status alterado ============>>>>>>>>>>>>>> " + newStatus, "statusChanged", null);

		// Se estava tocando e parou por algum problema irreversivel...
		if(newStatus == STATUS_UNLOADED.id && player.status.id == STATUS_PLAYING.id){ 
			handleEvent({type : EVENT_SOUND_STOPPED, caller : 'statusChanged', success : true, obj : null});
		// Se pausou e o status era diferente de pausado...
		} else if(newStatus == STATUS_PAUSED.id && player.status.id != STATUS_PAUSED.id){ 
			handleEvent({type : EVENT_PAUSED, caller : 'statusChanged', success : true, obj : null});
		// Se iniciou bufferizancao e  status atual nao eh bufferizando...
		} else if (newStatus == STATUS_BUFFERING.id && player.status.id != STATUS_BUFFERING.id){
			handleEvent({type : EVENT_BUFFERING, caller : 'statusChanged', success : true, obj : null});
		// Se comecou a tocar e status atual nao eh toncando...
		} else if (newStatus == STATUS_PLAYING.id && player.status.id != STATUS_PLAYING.id){
			handleEvent({type : EVENT_STARTED_PLAYING, caller : 'statusChanged', success : true, obj : null});
		// Se o player esta pronto e estava bufferizando...
		} else if (newStatus == STATUS_INITIAL.id && player.status.id == STATUS_BUFFERING.id){
			handleEvent({type : EVENT_TRACKS_LOADED, caller : 'statusChanged', success : true, obj : null});
		// Se pausou e o status era diferente de pausado...
		} else if(newStatus == STATUS_INITIAL.id && player.status.id != STATUS_INITIAL.id){ 
			handleEvent({type : EVENT_TRACKS_LOADED, caller : 'statusChanged', success : true, obj : null});
		}

		if (player.setlist != null && player.setlist.musics != null && player.setlist.musics.length > 0 && getIndexOfCurrentMusicInSetlist() + 1 < player.setlist.musics.length){
			if (player.currentMusic.calculatedTotalTime - player.currentTime < 10){
				player.setlist.timeToNext = player.currentMusic.music.totalTimeInSeconds - player.currentTime;
				player.setlist.nextMusic = player.setlist.musics[getIndexOfCurrentMusicInSetlist()+1].musicName;
			}
		}

		msCordovaPluginPlayer.setStatusCallback(statusChanged, new function(err){});

	}

	var getIndexOfCurrentMusicInSetlist = function(){

		return getIndexOfMusicInSetlist(player.currentMusic.music.musicId);

	}


	var getIndexOfMusicInSetlist = function(musicId){

		var idx = 0;
		var result = -1;

 		player.setlist.musics.forEach(function(entry){

			if (musicId == entry.musicId){
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

	var prepareMusicToBePlayed = function(musicId, callback, startImmediately){

		var promisses;
		var trackType;
		var configObj, configs;
		var mode;

		if (player.type == PLAYER_TYPE_SINGLETRACK_LOCAL  || player.type == PLAYER_TYPE_SETLIST){
			mode = "local";
		} else {
			mode = "remote";
		}

		if (player.type == PLAYER_TYPE_MULTITRACK){
			trackType = TRACK_TYPE_INSTRUMENT;
		} else if (player.type == PLAYER_TYPE_SINGLETRACK || player.type == PLAYER_TYPE_SINGLETRACK_LOCAL || player.type == PLAYER_TYPE_SETLIST){
			trackType = TRACK_TYPE_MIXED;
		}

		promisses = [];

		promisses.push(musicService.getMusicDetails(auth.token, musicId, trackType));
		promisses.push(musicService.getCifra(auth.token, musicId));

		$q.all(promisses).then(

            function(response) { 

        		//player.showCards = false;

        		player.currentMusic = response[0].bean;
        		player.currentMusic.iniciaImediatamente = startImmediately;

        		if (response[1].success == true){

	        		player.currentMusic.cifra = response[1];

	        		player.currentMusic.cifra.firstFraseIdx = -1;
	
	        		calculateFirstFraseIdx();
	        		createChordCards(response[1]);

					player.currentMusic.cifra.fraseBeans.forEach(function(entry){
						separateLyricsAndChords(entry);
					});

        		}

        		player.currentMusic.trackCards = [];

        		/**
        		* DETALHE DE VISUALIZACAO... TIRAR DO new-player.js
        		*/

        		var idy, idx;

        		idy = 0;
        		idx = 0;

        		player.currentMusic.trackCards[idy] = [];

        		player.currentMusic.tracks.forEach(function(entry){

        			if (idx % 4 == 0 && idx > 0){
        				idy++;
		        		player.currentMusic.trackCards[idy] = [];
        			}
        			
        			player.currentMusic.trackCards[idy].push(entry);

        			idx++;

        		});

        		/** FINAL DO DETALHE DE VISUALIZACAO */


        		player.log(LOG_LEVEL_DEBUG, "Track cards carregados", "prepareMusicToBePlayed", player.currentMusic.trackCards);

            	if (response[0].bean.music.status != 1){
            		player.currentMusic.calculatedTotalTime = 29;
            	}else{
		        	player.currentMusic.calculatedTotalTime = parseInt(player.currentMusic.music.totalTimeInSeconds) - 1;
            	}

				configs = {trackConfigs : []};

		 		player.currentMusic.tracks.forEach(function(entry) {

					entry.leds = {left : null, right : null};
					entry.lastDecibels = 128;

					entry.instrumentDisabledImagePath = entry.instrumentImagePath + "-disabled.jpg";
					entry.instrumentEnabledImagePath = entry.instrumentImagePath + ".jpg";

					configObj = {filePath : entry.filePath, level : entry.level, pan : entry.pan, enabled : entry.enabled, solo : entry.solo};

					configs.trackConfigs.push(configObj);

        		});

				msCordovaPluginPlayer.configPlayer(JSON.stringify(configs), player.currentMusic.music.musicId, (player.currentMusic.music.status != 1), player.currentMusic.music.artistName, player.currentMusic.music.musicName, player.fileSystem, mode, player.currentMusic.music.type == "multitrack",
    			//loadCurrentMusicTracks();

					function(message){
						callback(response[0]);
					},
					function(err){
						$ionicLoading.hide();
					}
				);

            	//callback(response[0]);

            },

            function(response) { 

            	player.log(LOG_LEVEL_ERROR, "ERROR WHILE LOADING MUSIC DETAIL.", "prepareMusicToBePlayed", response[0]);

            	callback();

            }

        ).finally(function() {

        });


	};

    var createChordCards = function(obj){

        var remainder;
        var counter;
        var cardIndex;
        var chordIndex;
        var chords = {chordCards : []};

        if(player.chordCards != null){
        	return;
        }

        counter = 0;
        cardIndex = -1;
        chordIndex = -1;

        chords.chordCards[0] = [];                        

        obj.acordeBeans.forEach(function (entry){

            remainder = counter % 5;

            if (remainder == 0) {

                cardIndex++;
                chordIndex = 0;

                chords.chordCards[cardIndex] = [];                        

            } else {
                chordIndex++;
            }

            chords.chordCards[cardIndex][chordIndex] = entry;

            entry.margin = (chordIndex==0)?"padding-right:2px;":
                           (chordIndex==1 || chordIndex==2)?"padding-right:1px;padding-left:1px;":"padding-left:2px;";

            counter++;

        });

        player.chordCards = chords.chordCards;

    };

	var calculateFirstFraseIdx = function(){

		var totalTime;

      	player.log(LOG_LEVEL_DEBUG, "calculateFirstFraseIdx foi chamado. ", "calculateFirstFraseIdx", null);

      	console.log(player);

		totalTime = 0;

		if (player.currentMusic.cifra.fraseBeans.length == 0){
			
			player.currentMusic.cifra.fraseIdx = -1;

			player.currentMusic.cifra.firstFraseIdx = -1;
			
			return;

		}

		if (player.currentMusic.cifra.firstFraseIdx > -1){

			player.currentMusic.cifra.fraseIdx = player.currentMusic.cifra.firstFraseIdx;

			return;
		}

       	if (player.currentMusic.music.status != 1){ // Se for uma demo...

           	player.log(LOG_LEVEL_DEBUG, "player.currentMusic.music.status != 1 ", "calculateFirstFraseIdx", null);

       		player.currentMusic.cifra.firstFraseIdx = -1;

			player.currentMusic.cifra.fraseBeans.forEach(function(entry, fraseIdx){

				if (entry.tempo >= 30){

           			player.log(LOG_LEVEL_DEBUG, "entry.tempo >= 30 ", "calculateFirstFraseIdx", null);

					player.currentMusic.cifra.fraseBeans[fraseIdx].tempo = entry.tempo - 30; // Zera o tempo do primeiro frase bean para mostrar logo

					if (player.currentMusic.cifra.fraseBeans[fraseIdx].tempo == 0){
						player.currentMusic.cifra.fraseBeans[fraseIdx].tempo = 1;
					}

					if (player.currentMusic.cifra.firstFraseIdx == -1){
						
						player.currentMusic.cifra.firstFraseIdx = fraseIdx - 1;
						player.currentMusic.cifra.fraseBeans[player.currentMusic.cifra.firstFraseIdx].tempo = 0;

						player.currentMusic.cifra.fraseIdx = player.currentMusic.cifra.firstFraseIdx;

		            	player.log(LOG_LEVEL_DEBUG, "player.currentMusic.cifra.fraseIdx: " + player.currentMusic.cifra.fraseIdx + "; ", "calculateFirstFraseIdx", null);

					}

				}

			});
			
       	} else {
       		player.currentMusic.cifra.fraseIdx = 0;
       	}

	};

	var changeTrackConfig = function(track){

		var promises = [];

		track.showMessage = false

		player.log(LOG_LEVEL_DEBUG, "Enviando configuracao de trilha para servidor...", null);

        promises.push(configService.changeMusicConfig(auth.token, track.id, track.level, track.pan, track.enabled, track.solo));

        $q.all(promises).then(

            function(response) { 
				player.log(LOG_LEVEL_DEBUG, "Alteracao de trilha enviada para servidor com sucesso", null);
            },
            function(response) { 
				player.log(LOG_LEVEL_DEBUG, "Falha ao alterar a trilha no servidor...", null);
            }

        );

	}


	var separateLyricsAndChords = function(fraseBean) {

		var regex = /\[[(a-z|A-Z|0-9|#|/)]*\]/g;
		//var str = 'Morrendo de [C]den[G]tro [F#m]pra fora';
		var m;
		var parts = [];
		var lastMatchIndex = 0;
		var lastMatchLength = 0
		var idx = 0;
		var chords;
		var lyrics;

		chords = "";

		while ((m = regex.exec(fraseBean.phrase)) != null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index == regex.lastIndex) {
				regex.lastIndex++;
			}

			// The result can be accessed through the `m`-variable.
			m.forEach((match, groupIndex) => {

				parts[idx] = Array(fraseBean.phrase.indexOf(match, lastMatchIndex) - lastMatchIndex + 1 - lastMatchLength ).join(" ");

				lastMatchIndex = fraseBean.phrase.indexOf(match, lastMatchIndex);
				lastMatchLength = match.length;

				chords = chords + parts[idx] + match.substring(1, match.length - 1);
				idx++;

			});

		}

		lyrics = fraseBean.phrase.replace(regex, '');

		fraseBean.phrase = lyrics;
		fraseBean.chords = chords;

	}

	var calculateLeds = function(){


		var ledIdx;
		var idx = 0;

		if (player.type == PLAYER_TYPE_MULTITRACK){

			msCordovaPluginPlayer.getDecibels(calculateLedscounter * INTERVAL_LED_CALCULATION_IN_MILLIS, 
				function(result){

					player.currentMusic.tracks.forEach(function (entry){

						var ledIdx = Math.floor(result[idx].value * 13);

						if (ledIdx > 13){
							ledIdx = 13;
						}

						if (ledIdx < 0){
							ledIdx = 0;
						}

						entry.leds.left = "img/level-led-" + ledIdx + ".png";
						entry.leds.right = "img/level-led-" + ledIdx + ".png";

						idx++;

					});

				}, 
				function(error){

				}
			);

			calculateLedscounter++;

		}


	};

	var _play = function(){

		var analyser;

		msCordovaPluginPlayer.play();


		if (player.currentMusic.music.status != 1){

			player.currentMusic.tracks.forEach(function (entry){
			});

		}

	}

	return {

		STATUS_UNLOADED : STATUS_UNLOADED,
		STATUS_INITIAL : STATUS_INITIAL,
		STATUS_PLAYING : STATUS_PLAYING,
		STATUS_PAUSED : STATUS_PAUSED,
		STATUS_BUFFERING : STATUS_BUFFERING,

		PLAYER_TYPE_NOT_DEFINED_YET : PLAYER_TYPE_NOT_DEFINED_YET,
		PLAYER_TYPE_MULTITRACK : PLAYER_TYPE_MULTITRACK,
		PLAYER_TYPE_SINGLETRACK : PLAYER_TYPE_SINGLETRACK,
		PLAYER_TYPE_SINGLETRACK_LOCAL : PLAYER_TYPE_SINGLETRACK_LOCAL,
		PLAYER_TYPE_SETLIST : PLAYER_TYPE_SETLIST,

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

		gotoMusicInSetlist: function(musicId){

			msCordovaPluginPlayer.unload();

			prepareMusicToBePlayed(musicId, function(){}, player.setlist.musics[getIndexOfMusicInSetlist(musicId)].inicio == 0);

		},

		/**
		* Metodo publico para carregar uma setlist para o player dado o szeu id
		*/
		loadSetlist: function(setlistId){

			player.type = PLAYER_TYPE_SETLIST;

			msCordovaPluginPlayer.setStatusCallback(statusChanged, new function(err){});

			getSetlistDetail(setlistId, function(response){

				if (response.success == true){

	            	// Carrega detalhes da setlist no objeto player
	            	player.setlist.musics = response.musics;
	            	player.setlist.name = response.title;
	            	player.setlist.id = response.id;

	            	// Carrega detalhe da musica atual (primeira) da setlist
	            	//_gotoMusicInSetlist(player.setlist.musics[0].musicId);
	            	prepareMusicToBePlayed(player.setlist.musics[0].musicId, function(){}, player.setlist.musics[0].inicio == 0);

				} else {

	            	player.log(LOG_LEVEL_ERROR, "ERROR WHILE LOADING SETLIST.", "loadSetlist", response);

	            	handleEvent({type : EVENT_SEVERAL_ERROR, caller : 'loadSetlist', success : false});

				}

			});

		},

		/**
		* Metodo publico para carregar uma musica dado o seu id para o player multitrack
		*/
		loadMusic: function(musicId, startImmediately, playerType, callback){

			msCordovaPluginPlayer.setStatusCallback(statusChanged, new function(err){});

			player.chordCards = null;

			if ((player.setlist != null && player.setlist.musics != null) || (!player.currentMusic) || (player.currentMusic.music.musicId != musicId) || (player.type != playerType)){

				player.type = playerType;

				msCordovaPluginPlayer.unload(function(message){

		        	prepareMusicToBePlayed(musicId, callback, startImmediately);

					player.setlist = {musics : null, 
			  			 name : '', 
			  			 id: -1,
			  			 timeToNext : -1,
			  			 nextMusic : ''};

				});
			}else{
				player.log(LOG_LEVEL_DEBUG, "Was playing music when load was called. Will not unload...", "loadMusic", null);
			}

		},

		/**
		* Metodo publico para mudar o nivel de um determinado canal
		*/
		changeLevel: function(track){

			msCordovaPluginPlayer.volume(track.level * player.masterLevel, track.filePath);

			track.message = parseInt(track.level * 100) + "%";
			track.showMessage = true;

			if (track.interval){
				$interval.cancel(track.interval);
			}

			track.interval = $interval(function(){
				changeTrackConfig(track);
			}, INTERVAL_MENSSAGE, 1);

			if (player.saveButtonEnabled == false){
				player.saveButtonEnabled = true;
			}

		},

		/**
		* Muda o nível do canal master
		*/
		changeMasterLevel: function(){

			msCordovaPluginPlayer.masterLevel(player.masterLevel);

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
		changeMasterPan: function(){

			msCordovaPluginPlayer.masterPan(parseFloat(player.masterPan));

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
		changePan: function(track){

			msCordovaPluginPlayer.stereo(parseFloat(track.pan), track.filePath);
			track.message = Math.abs(parseInt(track.pan * 100)) + ((track.pan > 0)?"R":"L");
			track.showMessage = true;

			if (track.interval){
				$interval.cancel(track.interval);
			}

			track.interval = $interval(function(){
				changeTrackConfig(track);
			}, INTERVAL_MENSSAGE, 1);

			if (player.saveButtonEnabled == false){
				player.saveButtonEnabled = true;
			}


		},

		/**
		* Desativa o solo de uma determinada trilha
		*/
		unactivateSolo: function(track){

			track.solo = false;
			msCordovaPluginPlayer.unsolo(track.filePath);

			changeTrackConfig(track);

			if (player.saveButtonEnabled == false){
				player.saveButtonEnabled = true;
			}


		},

		/**
		* Ativa o solo de uma determinada trilha
		*/
		activateSolo: function(track){

			track.solo = true;
			msCordovaPluginPlayer.solo(track.filePath);

			changeTrackConfig(track);


			if (player.saveButtonEnabled == false){
				player.saveButtonEnabled = true;
			}


		},

		/**
		* Ativa o mute de uma determinada trilha
		*/
		mute: function(track){

			msCordovaPluginPlayer.mute(true, track.filePath);

			track.enabled = false;

			track.message = "OFF";
			track.showMessage = true;

			if (track.interval){
				$interval.cancel(track.interval);
			}

			track.interval = $interval(function(){
				changeTrackConfig(track);
			}, INTERVAL_MENSSAGE, 1);

			player.log(LOG_LEVEL_DEBUG_DETAILS, "Track mutted: " + track.filePath, "mute");

			if (player.saveButtonEnabled == false){
				player.saveButtonEnabled = true;
			}


		},

		/**
		* Desativa o mute de um determinado canal
		*/
		unMute: function(track){

			msCordovaPluginPlayer.mute(false, track.filePath);

			track.enabled = true;

			track.message = "ON";
			track.showMessage = true;

			if (track.interval){
				$interval.cancel(track.interval);
			}

			track.interval = $interval(function(){
				changeTrackConfig(track);
			}, INTERVAL_MENSSAGE, 1);

			player.log(LOG_LEVEL_DEBUG_DETAILS, "Track unmutted: " + track.filePath, "unMute");

			if (player.saveButtonEnabled == false){
				player.saveButtonEnabled = true;
			}


		},

		/**
		* Inicia a musica
		*/
		play: function(){

			_play();

		},

		new: function($scope){

		},

		stop: function(successCallback){

			msCordovaPluginPlayer.unload(successCallback);

			player.currentMusic = null;
			player.chordCards = null;

			
			player.setlist = {musics : null, 
				  			 name : '', 
				  			 id: -1,
				  			 timeToNext : -1,
				  			 nextMusic : ''};

		},

		unloadSetlist : function(successCallback){

			msCordovaPluginPlayer.unload(successCallback);

			player.setlist = {musics : null, 
				  			 name : '', 
				  			 id: -1,
				  			 timeToNext : -1,
				  			 nextMusic : ''};

		},

		resume: function(){

			msCordovaPluginPlayer.play();

			calculateTimeAsString();

		},

		suspend: function(onSuccessCallback){

			player.timestampWhenPauseWasPressed = Date.now();

			msCordovaPluginPlayer.pause(onSuccessCallback);

		},


		download: function(){

			var ms_hostname = window.localStorage.getItem("environment");
	        var promises = [];
			var configObj, configs;

			var checkDownloadPercentage = function(percentage){

				msCordovaPluginPlayer.checkDownloadPercentage(

					percentage,

					function(messageAsString){

						//player.log(LOG_LEVEL_DEBUG, "Callback " + messageAsString + " chamado" , "checkDownloadPercentage", null);

						message = JSON.parse(messageAsString);

						if (message.songName === player.currentMusic.music.musicName.split(' ').join('')){

							player.downloadStarted = true;

							if (message.error == false && message.stillDownloading == false){

								player.downloadStarted = false;
								player.currentMusicWasSuccessfullyDownloaded = true;
								player.downloadProgress = 0;

								$ionicLoading.hide();
								$ionicLoading.show({ template: spinner + 'Sua playback já está disponível em \'Músicas\'! :)', animation: 'fade-in', noBackdrop: true, duration:3000});
								
								player.currentMusic.status = 1;

								player.saveButtonEnabled = false;

								player.musicBeenDownloaded = null;

							}else if (message.stillDownloading == true){

								player.downloadProgress = message.percentage;
								checkDownloadPercentage(message.percentage + 1);

							} else if (message.error == true){

								$ionicLoading.hide();
								$ionicLoading.show({ template: spinner + 'Houve um problema ao realizar o download da sua música! :(', animation: 'fade-in', noBackdrop: true, duration:2000});
								
								player.currentMusicWasSuccessfullyDownloaded = false;
								player.downloadStarted = false;
								player.downloadProgress = 0;

								player.musicBeenDownloaded = null;
							
							}

						}


					}, function(error){
						
						console.log("ERROR WHILE DOWNLOADING SONG");
						console.log(error);

						$ionicLoading.hide();
						$ionicLoading.show({ template: spinner + 'Houve um problema ao realizar o download da sua música! :(', animation: 'fade-in', noBackdrop: true, duration:2000});

						player.currentMusicWasSuccessfullyDownloaded = false;
						player.downloadStarted = false;
						player.downloadProgress = 0;

						player.musicBeenDownloaded = null;

					}
				);

			}

			//player.currentMusic.music.status = 1;
			
	        promises.push(musicService.buy(player.currentMusic.music.musicId, auth.token));

	        $q.all(promises).then(

	            function(response) { 

	            	player.currentMusic.music.status = 1;
					player.log(LOG_LEVEL_DEBUG, "Song was successfully bought.", "download", null);

					player.downloadStarted = true;

					configs = {trackConfigs : []};

					player.currentMusic.tracks.forEach(function (entry){

						configObj = {filePath : entry.filePath, level : entry.level, pan : entry.pan, enabled : entry.enabled, solo : entry.solo};

						configs.trackConfigs.push(configObj);

					});

		        	console.log("Music config was successfully created. Starting download");

					msCordovaPluginPlayer.download(JSON.stringify(configs), player.currentMusic.music.musicId, player.fileSystem, player.currentMusic.music.artistName, player.currentMusic.music.musicName, player.currentMusic.music.type == "multitrack", 
						
						function(message){

							player.musicBeenDownloaded = player.currentMusic.music;
							
							console.log(message);
							checkDownloadPercentage(1); // Player sera avisado quando o download atingir 1%

						}, 
						function(error){

							console.log(error);

							player.musicBeenDownloaded = null;

							$ionicLoading.hide();
							$ionicLoading.show({ template: spinner + 'Houve um problema ao realizar o download da sua música! :(', animation: 'fade-in', noBackdrop: true, duration:2000});

						}

					);



	            },
	            function(err) {
					player.log(LOG_LEVEL_DEBUG, "Was not possible to buy the song.", "checkDownloadPercentage", null);
	            }

	        ).finally(function() {
	            
	        });

			player.downloadProgress = 0;

			$ionicLoading.show({ template: spinner + 'Download sendo realizado...', noBackdrop: true, duration:2000, animation: 'fade-in' });

			player.downloadStarted = false;

		},

		changePosition: function(){

			calculateTimeAsString();

			if (player.seekInterval != null){
				$interval.cancel(player.seekInterval);
				player.seekInterval = null;
			}


			if (player.status == STATUS_PLAYING){
				
			}

			player.seekInterval = $interval(function(){

				player.seekInterval = null;

				msCordovaPluginPlayer.seek(parseInt(player.currentTime), function(obj){
	        		if (player.currentTime != obj.position){
	        			player.currentTime = obj.position;
						calculateLedscounter = obj.position * 10;
	        		}else{
	        			calculateLedscounter = player.currentTime * 10;
	        		}

	      			calculateTimeAsString();

				});

			}, 250, 1);

		},

		setLyricsChangedCallback: function(callback){

			player.lyticsChangedCallback = callback;

		}

	}


});
