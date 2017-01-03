module.factory('msPlayer', function($interval, $q, $cordovaFileTransfer, $ionicLoading, musicService, setlistService, auth, msCordovaPluginPlayer, configService){

	var calculateLedscounter = 0;

	var ANALIZER_NODE_BUFFER_SIZE = 1000;

	var STATUS_UNAVAILABLE = {id : -1, isPlayerInConsistentStatus : false, isPlaying : false, isPaused : false, isDownloading : false, shouldMonitorStatusChange : false, shouldKeepMonitoringLeds : false};
	var STATUS_INITIAL = {id : 0, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : false, shouldMonitorStatusChange : false, shouldKeepMonitoringLeds : false};
	var STATUS_PAUSED = {id : 1, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : true, isDownloading : false, shouldMonitorStatusChange : false, shouldKeepMonitoringLeds : false};
	var STATUS_PLAYING = {id : 2, isPlayerInConsistentStatus : true, isPlaying : true, isPaused : false, isDownloading : false, shouldMonitorStatusChange : true, shouldKeepMonitoringLeds : true};
	var STATUS_DOWNLOADING = {id : 3, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : true, shouldMonitorStatusChange : true, shouldKeepMonitoringLeds : false};
	var STATUS_BUFFERING = {id : 4, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : true, shouldMonitorStatusChange : true, shouldKeepMonitoringLeds : false};

	var EVENT_START_PLAYING = {id : 1, newStatus : STATUS_PLAYING, shouldResetCounters : false};
	var EVENT_TARCKS_LOADED = {id : 2, newStatus : STATUS_INITIAL, shouldResetCounters : true};
	var EVENT_SOUND_STOPS = {id : 3, newStatus : STATUS_INITIAL, shouldResetCounters : true};
	var EVENT_START_DOWNLOADING_TRACKS = {id : 4, newStatus : STATUS_DOWNLOADING, shouldResetCounters : false};
	var EVENT_DOWNLOAD_FAILED = {id : 5, newStatus : STATUS_UNAVAILABLE, shouldResetCounters : true};
	var EVENT_SUSPENDING = {id : 6, newStatus : STATUS_PAUSED, shouldResetCounters : false};
	var EVENT_BUFFERING = {id : 7, newStatus : STATUS_BUFFERING, shouldResetCounters : false};

	var LOG_LEVEL_DEBUG_DETAILS = 4;
	var LOG_LEVEL_DEBUG = 3;
	var LOG_LEVEL_INFO = 2;
	var LOG_LEVEL_ERROR = 1;

	var PLAYER_TYPE_MULTITRACK = 1;
	var PLAYER_TYPE_SINGLETRACK = 2;

	var INTERVAL_MENSSAGE = 2000;
	var INTERVAL_CHECK_GENERAL_STATUS = 500;

	var INTERVAL_LED_CALCULATION_IN_MILLIS = 100;

	var spinner = '<ion-spinner icon="dots" class="spinner-stable"></ion-spinner><br/>';

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
				  showCards : false,
				  sound : null,
				  isAnApp : false,
				  masterPan : 0,
				  masterLevel : 0.8,
				  type : 0,
				  currentTimeAsString : '',
				  message : '',
				  showMessage : false,
				  messageInterval : null,
				  playerSlideInterval : null,
				  checkStatusSoundInterval : null,
				  currentTime : 0,
				  lastMainDecibels : 128,
				  saveButtonEnabled : false,
				  analyserNodeMaster : null,
				  calculateLedsInterval : null,
				  changeLevelInterval : null,
				  currentMusicWasSuccessfullyDownloaded : false,
				  mainLeds : {left : null, right : null}};

	/**
	* Trata alteracao entre os status do player
	*/
	var handleEvent = function(event){

		player.log(LOG_LEVEL_DEBUG, "Event received.", "handleEvent", event);

		if (!event.type.newStatus.shouldMonitorStatusChange){

       		$interval.cancel(player.playerSlideInterval);
       		player.playerSlideInterval = null;

		} else {

			if (player.playerSlideInterval == null){
				player.playerSlideInterval = $interval(function(){
					player.currentTime++;
					calculateTimeAsString();
					checkStatusSound();
				}, 1000);
			}

		}

		if (event.type.newStatus.shouldKeepMonitoringLeds){

			player.mainLeds.left = "img/level-led-0.png";
			player.mainLeds.right = "img/level-led-0.png";

			player.currentMusic.tracks.forEach(function (entry){
				entry.leds.left = "img/level-led-0.png";
				entry.leds.right = "img/level-led-0.png";
			});

			player.setlist.timeToNext = -1;
			player.setlist.nextMusic = null;

		}

		if (event.type.shouldResetCounters){
       		player.currentTimeAsString = "0:00";
       		player.currentTime = 0;
       		player.downloadProgress = 0;
       		player.currentMusicWasSuccessfullyDownloaded = false;
		}

		// Se as trilhlas acabaram de carregar, verifica se precisa iniciar a tocar imediatamente
		if (event.type.id == EVENT_TARCKS_LOADED.id){

			if (player.setlist != null && player.setlist.musics != null && player.setlist.musics.length > 0 && player.setlist.musics[getIndexOfCurrentMusicInSetlist()].inicio == 0){
				_play();
			}

		}

		// Se o evento for de buffering...
		if (event.type.id == EVENT_BUFFERING.id){
			$ionicLoading.show({ template: spinner + 'Buffering. Please wait...' });
		} else if (player.status.id == STATUS_BUFFERING.id){ // Se o evento for diferente de buffering, mas o status atual eh buffering...
			$ionicLoading.hide();
		}

		// Se o evento for sound ended em uma selits e ainda existem musicas a serem tocadas, carrega a proxima
		if (event.type.id == EVENT_SOUND_STOPS.id){

			if (player.setlist != null && player.setlist.musics != null && getIndexOfCurrentMusicInSetlist() + 1 < player.setlist.musics.length){
				getMusicDetail(player.setlist.musics[getIndexOfCurrentMusicInSetlist()+1].musicId, function(){

				});
			}

		}

		player.status = event.type.newStatus;	

	}

	var checkStatusSound = function(){


		msCordovaPluginPlayer.playing(
			function(response){
				if(response.status == 4 || response.status == -1 || response.status == 0 || response.status == 5){ // NOT PLAYING
					handleEvent({type : EVENT_SOUND_STOPS, caller : 'checkStatusSound', success : true, obj : null});
				} else if(response.status == 6 && player.status.id != STATUS_BUFFERING.id){ // BUFFERING
					handleEvent({type : EVENT_BUFFERING, caller : 'checkStatusSound', success : true, obj : null});
				} else if (player.status.id == STATUS_BUFFERING.id && response.status == 1){
					handleEvent({type : EVENT_START_PLAYING, caller : 'checkStatusSound', success : true, obj : null});
				}
			}, function(error){
				// @TODO TRATAR QUANDO NAO EH POSSIVEL CAPTURAR O STATUS DO PLAYER. POR ENQUANTO ESTA PARANDO
				handleEvent({type : EVENT_SOUND_STOPS, caller : 'checkStatusSound', success : true, obj : null});
			}
		);
/*
		if (player.currentMusic.calculatedTotalTime - player.currentTime == 2 && player.currentMusic.status != 1){
			player.currentMusic.tracks.forEach(function (entry){
				msCordovaPluginPlayer.fade(entry.level * player.masterLevel, 0, 2000, entry.id);
			});
		}
*/
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

        		player.showCards = false;

        		player.currentMusic = response[0].bean;

        		player.currentMusic.trackCards = [];

        		/**
        		* DETALHE DE VISUALIZACAO... TIRAR DO new-player.js
        		*/

        		var idy, idx;

        		idy = 0;
        		idx = 0;

        		player.currentMusic.trackCards[idy] = [];

        		player.currentMusic.tracks.forEach(function(entry){

        			if (idx % 3 == 0 && idx > 0){
        				idy++;
		        		player.currentMusic.trackCards[idy] = [];
        			}
        			
        			player.currentMusic.trackCards[idy].push(entry);

        			idx++;

        		});

        		/** FINAL DO DETALHE DE VISUALIZACAO */

        		console.log(player.currentMusic.trackCards);

            	if (response[0].bean.status != 1){
            		player.currentMusic.calculatedTotalTime = 29;
            	}else{
		        	player.currentMusic.calculatedTotalTime = parseInt(player.currentMusic.totalTimeInSeconds) - 1;
            	}


		 		player.currentMusic.tracks.forEach(function(entry) {

					entry.leds = {left : null, right : null};
					entry.lastDecibels = 128;

					entry.instrumentDisabledImagePath = entry.instrumentImagePath + "-disabled.jpg";
					entry.instrumentEnabledImagePath = entry.instrumentImagePath + ".jpg";

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

	/**
	* Carrega as trilhas da musica corrente
	*/
	var loadCurrentMusicTracks = function(){

		var urls = [];
        var ms_hostname;
        var uri;
        var intervalToCheckStatus;

        $ionicLoading.show({ template: spinner + 'Buffering. Please wait...' });

        ms_hostname = window.localStorage.getItem("environment");

        // Prepara URLs de leitura das tracks para player SingleTrack
        if (player.type == PLAYER_TYPE_SINGLETRACK){

	        uri = {uri : player.currentMusic.musicId + ".song" ,
	               id : player.currentMusic.musicId,
	               isMute : false,
	               isSolo : false,
	               level : 1,
	               pan : 0};

			urls.push(uri);

        }

        // Prepara URLs de leitura das tracks para player MultiTrack
        if (player.type == PLAYER_TYPE_MULTITRACK){

			player.currentMusic.tracks.forEach(function (entry){

	            uri = {uri : ms_hostname + "/MultiSongs/api/download/music/wav/" + auth.token + "/" + entry.id + "/false", // + (player.currentMusic.status != 1),
	                   id : entry.id,
	                   isMute : entry.enabled == false,
	                   isSolo : entry.solo,
	                   level : entry.level,
	                   pan : entry.pan};

				urls.push(uri);

			});

        }

		msCordovaPluginPlayer.createPlugin((player.currentMusic.status != 1), 44100, 16, 2, urls, player.fileSystem, 
			function(message){

				intervalToCheckStatus = $interval(
					function(){
						msCordovaPluginPlayer.playing(
							function(message){
								if (message.status == 4){
						        	handleEvent({type : EVENT_TARCKS_LOADED, caller : 'loadCurrentMusicTracks', success : true, obj : null});
									$ionicLoading.hide();
									player.showCards = true;
									$interval.cancel(intervalToCheckStatus);
								}
							}, function(error){
								console.log(error);
								$interval.cancel(intervalToCheckStatus);
								$ionicLoading.hide();
							}
						);
					}, 
				500);

			},
			function(err){
				$ionicLoading.hide();
			}
		);

	};


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


			if (player.currentMusic.status != 1){

				player.currentMusic.tracks.forEach(function (entry){
					msCordovaPluginPlayer.fade(0, entry.level * player.masterLevel, 2000, entry.id);
				});

			}

   	  		handleEvent({type : EVENT_START_PLAYING, caller : 'play', success : true, obj : null});

	}

	var _gotoMusicInSetlist = function(musicId){

    	getMusicDetail(musicId, function(response){

    		if (response.success){
        		
	            	player.log(LOG_LEVEL_ERROR, "Setlist detail successfully read.", "loadSetlist", response);

    		}else{

    			player.log(LOG_LEVEL_ERROR, "Setlist detail NOT read.", "loadSetlist", response);

    			// @TODO: Mensagem para usuario - Primeira musica da playlist nao carregada com sucesso

    			// Dispara evento de STATUS_INICIAL do player apos a carga com sucesso da playlist
    			handleEvent({type : EVENT_DOWNLOAD_FAILED, caller : 'loadSetlist', success : false, obj : player.setlist.id});

    		}

    	});

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

		gotoMusicInSetlist: function(musicId){

			handleEvent({type : EVENT_SOUND_STOPS, caller : 'gotoMusicInSetlist', success : true, obj : null});

			_gotoMusicInSetlist(musicId);

		},

		/**
		* Carrega uma setlist para o player
		*/
		loadSetlist: function(setlistId){

			player.type = PLAYER_TYPE_SINGLETRACK;

      		handleEvent({type : EVENT_START_DOWNLOADING_TRACKS, caller : 'loadSetlist', success : true, obj : setlistId});

			getSetlistDetail(setlistId, function(response){

				if (response.success == true){

	            	// Carrega detalhes da setlist no objeto player
	            	player.setlist.musics = response.musics;
	            	player.setlist.name = response.title;
	            	player.setlist.id = response.id;

	            	// Carrega detalhe da musica atual (primeira) da setlist
	            	_gotoMusicInSetlist(player.setlist.musics[0].musicId);

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

			player.type = PLAYER_TYPE_MULTITRACK;

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

			if (player.saveButtonEnabled == false){
				player.saveButtonEnabled = true;
			}

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

			if (player.saveButtonEnabled == false){
				player.saveButtonEnabled = true;
			}


		},

		/**
		* Desativa o solo de uma determinada trilha
		*/
		unactivateSolo: function($scope, track){

			track.solo = false;
			msCordovaPluginPlayer.unsolo(track.id);

			if (player.saveButtonEnabled == false){
				player.saveButtonEnabled = true;
			}


		},

		/**
		* Ativa o solo de uma determinada trilha
		*/
		activateSolo: function($scope, track){

			track.solo = true;
			msCordovaPluginPlayer.solo(track.id);

			if (player.saveButtonEnabled == false){
				player.saveButtonEnabled = true;
			}


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

			if (player.saveButtonEnabled == false){
				player.saveButtonEnabled = true;
			}


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

			var ms_hostname = window.localStorage.getItem("environment");
			var intervalToCheckDownload;
	        var promises = [];

			player.currentMusic.status = 1;
			player.saveButtonEnabled = false;

			player.downloadProgress = 1;

			$ionicLoading.show({ template: spinner + 'Download in Progress...' });

			player.currentMusic.tracks.forEach(function (entry){
		        promises.push(configService.changeMusicConfig(auth.token, entry.id, entry.level, entry.pan, entry.enabled, entry.solo));
			});


	        $q.all(promises).then(

	            function(response) { 

	            	console.log("Music config was successfully created. Starting download");

					msCordovaPluginPlayer.download(player.currentMusic.musicId, ms_hostname + "/MultiSongs/api/download/music/mix/" + auth.token + "/" + player.currentMusic.musicId, 
						function(message){
							console.log(message)
						}, 
						function(error){
							console.log(error);
							$interval.cancel(intervalToCheckDownload);
							player.currentMusic.status = 0;
						}
					);

					intervalToCheckDownload = $interval(
						function(){
							msCordovaPluginPlayer.checkDownloadPercentage(
								function(message){
									if (message.percentage == 1){
										$interval.cancel(intervalToCheckDownload);
										player.currentMusicWasSuccessfullyDownloaded = true;
										player.downloadProgress = 0;
										$ionicLoading.hide();
									}else{
										player.downloadProgress = message.percentage * 100
									}
								}, function(error){
									console.log("ERROR WHILE DOWNLOADING SONG");
									console.log(error);
									$interval.cancel(intervalToCheckDownload);
									player.currentMusicWasSuccessfullyDownloaded = false;
									player.downloadProgress = 0;
									$ionicLoading.hide();
								}
							);
						}, 
					500);

	            }

	        );


		},

		changePosition: function($scope){

			if (player.changeLevelInterval != null){
				$interval.cancel(player.changeLevelInterval);
			}

			player.changeLevelInterval = $interval(function(){

				player.changeLevelInterval = null;

				msCordovaPluginPlayer.seek(parseInt(player.currentTime), function(obj){
					console.log(obj);
	        		if (player.currentTime != obj.position){
	        			player.currentTime = obj.position;
						calculateLedscounter = obj.position * 10;
	        		}else{
	        			calculateLedscounter = player.currentTime * 10;
	        		}

	      			calculateTimeAsString();

				});

			}, 50, 1);

		}

	}


});
