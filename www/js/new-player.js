module.factory('msPlayer', function($interval, $q, $cordovaFileTransfer, $ionicLoading, musicService, setlistService, auth, msCordovaPluginPlayer, configService){

	var calculateLedscounter = 0;

	var ANALIZER_NODE_BUFFER_SIZE = 1000;

/*
	var STATUS_UNAVAILABLE = {id : -1, isPlayerInConsistentStatus : false, isPlaying : false, isPaused : false, isDownloading : false, shouldMonitorStatusChange : false, shouldKeepMonitoringLeds : false};
	var STATUS_INITIAL = {id : 0, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : false, shouldMonitorStatusChange : false, shouldKeepMonitoringLeds : false};
	var STATUS_PAUSED = {id : 1, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : true, isDownloading : false, shouldMonitorStatusChange : false, shouldKeepMonitoringLeds : false};
	var STATUS_PLAYING = {id : 2, isPlayerInConsistentStatus : true, isPlaying : true, isPaused : false, isDownloading : false, shouldMonitorStatusChange : true, shouldKeepMonitoringLeds : true};
	var STATUS_DOWNLOADING = {id : 3, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : true, shouldMonitorStatusChange : true, shouldKeepMonitoringLeds : false};
	var STATUS_BUFFERING = {id : 4, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : true, shouldMonitorStatusChange : true, shouldKeepMonitoringLeds : false};
*/
	var STATUS_UNAVAILABLE = {id : -1, isPlayerInConsistentStatus : false, isPlaying : false, isPaused : false, isDownloading : false, shouldMonitorStatusChange : false, shouldKeepMonitoringLeds : false};
	var STATUS_INITIAL = {id : 4, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : false, shouldMonitorStatusChange : false, shouldKeepMonitoringLeds : false};
	var STATUS_PAUSED = {id : 2, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : true, isDownloading : false, shouldMonitorStatusChange : false, shouldKeepMonitoringLeds : false};
	var STATUS_PLAYING = {id : 1, isPlayerInConsistentStatus : true, isPlaying : true, isPaused : false, isDownloading : false, shouldMonitorStatusChange : true, shouldKeepMonitoringLeds : true};
	var STATUS_BUFFERING = {id : 6, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : true, shouldMonitorStatusChange : true, shouldKeepMonitoringLeds : false};
	var STATUS_TRANSIENT_TO_PLAY = {id : 7, isPlayerInConsistentStatus : true, isPlaying : false, isPaused : false, isDownloading : false, shouldMonitorStatusChange : true, shouldKeepMonitoringLeds : true};

	var EVENT_STARTED_PLAYING = {id : 1, newStatus : STATUS_PLAYING, shouldResetCounters : false};
	var EVENT_SEEKING = {id : 1, newStatus : STATUS_PAUSED, shouldResetCounters : false};
	var EVENT_TRACKS_LOADED = {id : 2, newStatus : STATUS_INITIAL, shouldResetCounters : true};
	var EVENT_SOUND_STOPPED = {id : 3, newStatus : STATUS_INITIAL, shouldResetCounters : true};
	var EVENT_START_DOWNLOADING_TRACKS = {id : 4, newStatus : STATUS_BUFFERING, shouldResetCounters : false};
	var EVENT_SEVERAL_ERROR = {id : 5, newStatus : STATUS_UNAVAILABLE, shouldResetCounters : true};
	var EVENT_PAUSED = {id : 6, newStatus : STATUS_PAUSED, shouldResetCounters : false};
	var EVENT_BUFFERING = {id : 7, newStatus : STATUS_BUFFERING, shouldResetCounters : false};

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
				  showCards : true,
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
				  seekInterval : null,
				  lyricsInterval : null,
				  timestampNextChangeInLyrics : 0,
				  timestampWhenPauseWasPressed : 0,
				  firstFraseIdx : -1,
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

		if (!event.type.newStatus.shouldMonitorStatusChange){

       		$interval.cancel(player.checkStatusSoundInterval);
       		player.checkStatusSoundInterval = null;

		} else {

			if (player.checkStatusSoundInterval == null){
				player.checkStatusSoundInterval = $interval(function(){
					checkStatusSound();
				}, 250);
			}

		}

		if (event.type.newStatus.shouldKeepMonitoringLeds == true){

			player.mainLeds.left = "img/level-led-0.png";
			player.mainLeds.right = "img/level-led-0.png";

			player.currentMusic.tracks.forEach(function (entry){
				entry.leds.left = "img/level-led-0.png";
				entry.leds.right = "img/level-led-0.png";
			});

			player.setlist.timeToNext = -1;
			player.setlist.nextMusic = null;

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
	
			if (player.lyricsInterval != null){
				$interval.cancel(player.lyricsInterval);
			}

   			calculateFirstFraseIdx();

			if (player.lyticsChangedCallback != null){
				player.lyticsChangedCallback(player.currentMusic.cifra.fraseIdx);
			}

		}
/*
		// Se o evento for de buffering...
		if (event.type.id == EVENT_BUFFERING.id){
			$ionicLoading.show({ template: spinner + 'Carregando...', animation: 'fade-in' });
		} else if (player.status.id == STATUS_BUFFERING.id){ // Se o evento for diferente de buffering, mas o status atual eh buffering...
			$ionicLoading.hide();
		}
*/
		// Se o evento for sound ended em uma selits e ainda existem musicas a serem tocadas, carrega a proxima
		if (event.type.id == EVENT_SOUND_STOPPED.id){

			if (player.setlist != null && player.setlist.musics != null && getIndexOfCurrentMusicInSetlist() + 1 < player.setlist.musics.length){
				prepareMusicToBePlayed(player.setlist.musics[getIndexOfCurrentMusicInSetlist()+1].musicId, function(){

				});
			}

		}

		// Se as trilhlas acabaram de carregar, verifica se precisa iniciar a tocar imediatamente
		if (event.type.id == EVENT_TRACKS_LOADED.id){

			if (player.currentMusic.iniciaImediatamente){

				console.log("INICIANDO MUSICA AUTOMATICAMENTE");

				player.status = STATUS_TRANSIENT_TO_PLAY; // Garante que o player nao envie um evento startPlaying pelo checkStatusSound enquanto o player esta iniciando a execucao da musica...

				player.currentMusic.iniciaImediatamente = false; // Para garantir que apos o fim da musica ela nao reinicia automaticamente novamente...

				_play();

				return;

			}else{
				console.log("MUSICA NAO INICIARA AUTOMATICAMENTE");
			}

		}

		player.status = event.type.newStatus;	

	}

	var handleCifra = function(){

		var nextTime = -1;

		if (player.lyricsInterval != null){
			$interval.cancel(player.lyricsInterval);
		}

		if (player.currentMusic.cifra.fraseIdx > -1 && player.currentMusic.cifra.fraseIdx < player.currentMusic.cifra.fraseBeans.length - 1){
			
			nextTime = player.currentMusic.cifra.fraseBeans[player.currentMusic.cifra.fraseIdx].tempo * 1000;

			// Condicao verdadeira se o player havia sido pausado e iniciado novamente apos pressionar o play
			// Essa eh a condicao para timestampWhenPauseWasPressed ser maior que zero
			if (player.timestampWhenPauseWasPressed > 0){

				// Programa nextTime para a diferenca de tempo entre o momento em que o pause foi chamado e a mudanca de frase que
				// havia sido programada antes 
				nextTime = player.timestampNextChangeInLyrics - player.timestampWhenPauseWasPressed;

				player.timestampWhenPauseWasPressed = 0;

			}

			player.currentMusic.cifra.mostrar = CIFRA_TROCAR_FRASE;

		} else {
			player.currentMusic.cifra.mostrar = -1;
		}

/*
		if (player.currentMusic.cifra.acordeIdx > -1 && player.currentMusic.cifra.acordeIdx < player.currentMusic.cifra.acordeBeans.length - 1){
	
			if (Math.abs(nextTime - player.currentMusic.cifra.acordeBeans[player.currentMusic.cifra.acordeIdx].tempo) < 250){
				player.currentMusic.cifra.mostrar = CIFRA_TROCAR_FRASE_ACORDE;
			} else if (nextTime > player.currentMusic.cifra.acordeBeans[player.currentMusic.cifra.acordeIdx].tempo){
				nextTime = player.currentMusic.cifra.acordeBeans[player.currentMusic.cifra.acordeIdx].tempo;
				player.currentMusic.cifra.mostrar = CIFRA_TROCAR_ACORDE;
			}
	
		}
*/
		if (nextTime > -1){

			player.timestampNextChangeInLyrics = Date.now() + nextTime;

			player.lyricsInterval = $interval(function(){
/*
				if (player.currentMusic.cifra.mostrar == CIFRA_TROCAR_FRASE_ACORDE){
					
					player.currentMusic.cifra.fraseIdx++;
					player.currentMusic.cifra.acordeIdx++;

				} else if (player.currentMusic.cifra.mostrar == CIFRA_TROCAR_FRASE){

					player.currentMusic.cifra.fraseIdx++;

				} else {

					player.currentMusic.cifra.acordeIdx++;

				}
*/

				if (player.currentMusic.cifra.mostrar == CIFRA_TROCAR_FRASE){

					player.currentMusic.cifra.fraseIdx++;

					if (player.lyticsChangedCallback != null){
						player.lyticsChangedCallback(player.currentMusic.cifra.fraseIdx);
					}

				}

				handleCifra();

		   },
		   nextTime, 
		   1);

		}

	}

	var checkStatusSound = function(){

        if (player.currentMusic){

			msCordovaPluginPlayer.playing(
				function(response){
					// Se estava tocando e parou por algum problema irreversivel...
					if(response.status == STATUS_UNAVAILABLE.id && player.status.id == STATUS_PLAYING.id){ 
						handleEvent({type : EVENT_SOUND_STOPPED, caller : 'checkStatusSound', success : true, obj : null});
					// Se pausou e o status era diferente de pausado...
					} else if(response.status == STATUS_PAUSED.id && player.status.id != STATUS_PAUSED.id){ 
						handleEvent({type : EVENT_PAUSED, caller : 'checkStatusSound', success : true, obj : null});
					// Se iniciou bufferizancao e  status atual nao eh bufferizando...
					} else if (response.status == STATUS_BUFFERING.id && player.status.id != STATUS_BUFFERING.id){
						handleEvent({type : EVENT_BUFFERING, caller : 'checkStatusSound', success : true, obj : null});
					// Se comecou a tocar e status atual nao eh toncando...
					} else if (response.status == STATUS_PLAYING.id && player.status.id != STATUS_PLAYING.id && player.status.id != STATUS_TRANSIENT_TO_PLAY.id){
						handleEvent({type : EVENT_STARTED_PLAYING, caller : 'checkStatusSound', success : true, obj : null});
					// Se o player esta pronto e estava bufferizando...
					} else if (response.status == STATUS_INITIAL.id && player.status.id == STATUS_BUFFERING.id){
						handleEvent({type : EVENT_TRACKS_LOADED, caller : 'checkStatusSound', success : true, obj : null});
					// Se pausou e o status era diferente de pausado...
					} else if(response.status == STATUS_INITIAL.id && player.status.id != STATUS_INITIAL.id){ 
						handleEvent({type : EVENT_SOUND_STOPPED, caller : 'checkStatusSound', success : true, obj : null});
					}
					/*
					if(response.status == 4 || response.status == -1 || response.status == 5){ // NOT PLAYING
						console.log(response);
						handleEvent({type : EVENT_SOUND_STOPPED, caller : 'checkStatusSound', success : true, obj : null});
					} else if(response.status == 6 && player.status.id != STATUS_BUFFERING.id){ // BUFFERING
						handleEvent({type : EVENT_BUFFERING, caller : 'checkStatusSound', success : true, obj : null});
					} else if (player.status.id == STATUS_BUFFERING.id && response.status == 1){
						handleEvent({type : EVENT_STARTED_PLAYING, caller : 'checkStatusSound', success : true, obj : null});
					} else if (player.status.id == STATUS_BUFFERING.id){
						//$ionicLoading.show({ template: spinner + 'BufferinSTATUS_TRANSIENT_TO_PLAY.idg. Please wait ' + response.buffer + '% ...' });
						$ionicLoading.show({ template: spinner + 'Buffering. Please wait...' });
					}
					*/
				}, function(error){
					// @TODO TRATAR QUANDO NAO EH POSSIVEL CAPTURAR O STATUS DO PLAYER. POR ENQUANTO ESTA PARANDO
					console.log(error);
					handleEvent({type : EVENT_SOUND_STOPPED, caller : 'checkStatusSound', success : true, obj : null});
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
					player.setlist.timeToNext = player.currentMusic.music.totalTimeInSeconds - player.currentTime;
					player.setlist.nextMusic = player.setlist.musics[getIndexOfCurrentMusicInSetlist()+1].musicName;
				}
			}

		}

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

		if (player.type == PLAYER_TYPE_MULTITRACK || player.type == PLAYER_TYPE_SETLIST){
			trackType = TRACK_TYPE_INSTRUMENT;
		} else if (player.type == PLAYER_TYPE_SINGLETRACK || player.type == PLAYER_TYPE_SINGLETRACK_LOCAL){
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
	
	        		calculateFirstFraseIdx();
	        		createChordCards(response[1]);

					player.currentMusic.cifra.fraseBeans.forEach(function(entry){
						separateLyricsAndChords(entry);
					});


/*
		       		player.currentMusic.cifra.fraseBeans.forEach(function(entry){

						while ((m = regex.exec(entry.phrase)) !== null) {
						    // This is necessary to avoid infinite loops with zero-width matches
						    if (m.index === regex.lastIndex) {
						        regex.lastIndex++;
						    }
						    
						    // The result can be accessed through the `m`-variable.
						    m.forEach((match, groupIndex) => {
						        console.log(`Found match, group ${groupIndex}: ${match}`);
								entry.phraseReviewed = entry
						    });

						}

		       		});
*/

/*
					if (response[1].acordeBeans.length > 0){
		       			player.currentMusic.cifra.acordeIdx = 0;
					}else{
						player.currentMusic.cifra.acordeIdx = -1;
					}
*/

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

        			if (idx % 3 == 0 && idx > 0){
        				idy++;
		        		player.currentMusic.trackCards[idy] = [];
        			}
        			
        			player.currentMusic.trackCards[idy].push(entry);

        			idx++;

        		});

        		/** FINAL DO DETALHE DE VISUALIZACAO */

        		console.log(player.currentMusic.trackCards);

            	if (response[0].bean.music.status != 1){
            		player.currentMusic.calculatedTotalTime = 29;
            	}else{
		        	player.currentMusic.calculatedTotalTime = parseInt(player.currentMusic.music.totalTimeInSeconds) - 1;
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

            	player.log(LOG_LEVEL_ERROR, "ERROR WHILE LOADING MUSIC DETAIL.", "prepareMusicToBePlayed", response[0]);

            	callback(response[0]);

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

		totalTime = 0;

		if (player.currentMusic.cifra.fraseBeans.length == 0){
			
			player.currentMusic.cifra.fraseIdx = -1;

			player.firstFraseIdx = -1;
			
			return;

		}

		if (player.firstFraseIdx > -1){

			player.currentMusic.cifra.fraseIdx = player.firstFraseIdx;

			return;
		}

       	if (player.currentMusic.music.status != 1){ // Se for uma demo...

			player.currentMusic.cifra.fraseBeans.every(function(entry, fraseIdx){
				
				totalTime += entry.tempo;

				if (totalTime >= 30){

					totalTime = totalTime - 30;
					player.currentMusic.cifra.fraseIdx = fraseIdx;

					player.currentMusic.cifra.fraseBeans[fraseIdx].tempo = 0; // Zera o tempo do primeiro frase bean para mostrar logo

					if (fraseIdx < player.currentMusic.cifra.fraseBeans.length - 1){
						player.currentMusic.cifra.fraseBeans[fraseIdx + 1].tempo = totalTime;
					}

					player.firstFraseIdx = fraseIdx;

					return false;

				} else {

					return true;

				}

			});

       	} else {
       		player.currentMusic.cifra.fraseIdx = 0;
       	}

	};


	var separateLyricsAndChords = function(fraseBean) {

		var regex = /\[[(a-z|A-Z|0-9|#)]*\]/g;
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

	/**
	* Carrega as trilhas da musica corrente
	*/
	var loadCurrentMusicTracks = function(){

		var urls = [];
        var ms_hostname;
        var uri;
        var intervalToCheckStatus;

        //$ionicLoading.show({ template: spinner + 'Buffering. Please wait 0%...' });

        ms_hostname = window.localStorage.getItem("environment");

        // Prepara URLs de leitura das tracks para player SingleTrack local ou setlist
        if (player.type == PLAYER_TYPE_SETLIST || player.type == PLAYER_TYPE_SINGLETRACK_LOCAL){

          	player.log(LOG_LEVEL_ERROR, "LOADING SONG FROM FILE.", "loadCurrentMusicTracks", null);

	        uri = {uri : player.currentMusic.music.musicId + ".song" ,
	               id : player.currentMusic.music.musicId,
	               isMute : false,
	               isSolo : false,
	               level : 1,
	               pan : 0};

			urls.push(uri);

        } else {

			player.currentMusic.tracks.forEach(function (entry){

	            uri = {uri : ms_hostname + "/MultiSongs/api/download/music/track/" + auth.token + "/" + entry.id + "/" + (player.currentMusic.music.status != 1),
	                   id : entry.id,
	                   isMute : entry.enabled == false,
	                   isSolo : entry.solo,
	                   level : entry.level,
	                   channels : entry.canais,
	                   pan : entry.pan};

				urls.push(uri);

			});

        }

		msCordovaPluginPlayer.createPlugin((player.currentMusic.music.status != 1), 44100, 16, 2, urls, player.fileSystem, 
			function(message){
/*
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
*/
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


		if (player.currentMusic.music.status != 1){

			player.currentMusic.tracks.forEach(function (entry){
				//msCordovaPluginPlayer.fade(0, entry.level * player.masterLevel, 2000, entry.id);
			});

		}

	  		handleEvent({type : EVENT_STARTED_PLAYING, caller : 'play', success : true, obj : null});

	}
/*
	var _gotoMusicInSetlist = function(musicId){

    	prepareMusicToBePlayed(musicId, function(response){

    		if (response.success){
        		
	            	player.log(LOG_LEVEL_ERROR, "Setlist detail successfully read.", "loadSetlist", response);

    		}else{

    			player.log(LOG_LEVEL_ERROR, "Setlist detail NOT read.", "loadSetlist", response);

    			// @TODO: Mensagem para usuario - Primeira musica da playlist nao carregada com sucesso

    			// Dispara evento de STATUS_INITIAL do player apos a carga com sucesso da playlist
    			handleEvent({type : EVENT_SEVERAL_ERROR, caller : 'loadSetlist', success : false, obj : player.setlist.id});

    		}

    	});

	}
*/

	return {

		STATUS_UNAVAILABLE : STATUS_UNAVAILABLE,
		STATUS_INITIAL : STATUS_INITIAL,
		STATUS_PLAYING : STATUS_PLAYING,
		STATUS_PAUSED : STATUS_PAUSED,

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

			handleEvent({type : EVENT_SOUND_STOPPED, caller : 'gotoMusicInSetlist', success : true, obj : null});

			//_gotoMusicInSetlist(musicId);

			prepareMusicToBePlayed(musicId, function(obj){}, player.setlist.musics[getIndexOfMusicInSetlist(musicId)].inicio == 1);

		},

		/**
		* Metodo publico para carregar uma setlist para o player dado o szeu id
		*/
		loadSetlist: function(setlistId){

			player.type = PLAYER_TYPE_SETLIST;

      		//handleEvent({type : EVENT_START_DOWNLOADING_TRACKS, caller : 'loadSetlist', success : true, obj : setlistId});

      		handleEvent({type : EVENT_BUFFERING, caller : 'loadSetlist', success : true, obj : setlistId});

			getSetlistDetail(setlistId, function(response){

				if (response.success == true){

	            	// Carrega detalhes da setlist no objeto player
	            	player.setlist.musics = response.musics;
	            	player.setlist.name = response.title;
	            	player.setlist.id = response.id;

	            	// Carrega detalhe da musica atual (primeira) da setlist
	            	//_gotoMusicInSetlist(player.setlist.musics[0].musicId);
	            	prepareMusicToBePlayed(player.setlist.musics[0].musicId, function(obj){}, player.setlist.musics[0].inicio == 1);

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

			player.type = playerType;

			if ((player.setlist != null && player.setlist.musics != null) || (!player.currentMusic) || (player.currentMusic.music.musicId != musicId)){

				if (player.checkStatusSoundInterval){
		       		$interval.cancel(player.checkStatusSoundInterval);
		       		player.checkStatusSoundInterval = null;
				}

				if (player.lyricsInterval){
		       		$interval.cancel(player.lyricsInterval);
		       		player.lyricsInterval = null;
				}

				msCordovaPluginPlayer.unload(function(message){

		      		handleEvent({type : EVENT_BUFFERING, caller : 'loadMusic', success : true, obj : musicId});

		        	prepareMusicToBePlayed(musicId, function(response){

		        		if (callback){
		        			callback(response);
		        		}

		        		if (response.success){

		        			player.log(LOG_LEVEL_ERROR, "Music detail successfully read. startImmediately = " + startImmediately, "loadMusic", response);

							player.setlist = {musics : null, 
								  			 name : '', 
								  			 id: -1,
								  			 timeToNext : -1,
								  			 nextMusic : ''};
				  			 
		           		}else{

		        			// @TODO: Mensagem para usuario - Musica nao carregada com sucesso

		        			player.log(LOG_LEVEL_ERROR, "Music detail NOT read.", "loadMusic", response);

		        			// Dispara evento de STATUS_INITIAL do player apos a carga com sucesso da playlist
		    	        	handleEvent({type : EVENT_SEVERAL_ERROR, caller : 'loadMusic', success : false, obj : response});

		        		}

		        	}, startImmediately);

				});
			}else{
				player.log(LOG_LEVEL_DEBUG, "Was playing music when load was called. Will not unload...", "loadMusic", null);
			}

      		//handleEvent({type : EVENT_START_DOWNLOADING_TRACKS, caller : 'loadMusic', success : true, obj : musicId});

		},

		/**
		* Metodo publico para mudar o nivel de um determinado canal
		*/
		changeLevel: function(track){

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
		changeMasterLevel: function(){

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
		changeMasterPan: function(){

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
		changePan: function(track){

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
		unactivateSolo: function(track){

			track.solo = false;
			msCordovaPluginPlayer.unsolo(track.id);

			if (player.saveButtonEnabled == false){
				player.saveButtonEnabled = true;
			}


		},

		/**
		* Ativa o solo de uma determinada trilha
		*/
		activateSolo: function(track){

			track.solo = true;
			msCordovaPluginPlayer.solo(track.id);

			if (player.saveButtonEnabled == false){
				player.saveButtonEnabled = true;
			}


		},

		/**
		* Ativa o mute de uma determinada trilha
		*/
		mute: function(track){

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
		unMute: function(track){

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

			player.currentMusic = null;
			
			player.setlist = {musics : null, 
				  			 name : '', 
				  			 id: -1,
				  			 timeToNext : -1,
				  			 nextMusic : ''};

			handleEvent({type : EVENT_SOUND_STOPPED, caller : 'stop', success : true});

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

			handleEvent({type : EVENT_STARTED_PLAYING, caller : 'resume', success : true});

		},

		suspend: function(){

			player.timestampWhenPauseWasPressed = Date.now();

			if (player.lyricsInterval){
				$interval.cancel(player.lyricsInterval);
			}

			msCordovaPluginPlayer.pause();

			handleEvent({type : EVENT_PAUSED, caller : 'suspend', success : true});

		},


		download: function(){

			var ms_hostname = window.localStorage.getItem("environment");
			var intervalToCheckDownload;
	        var promises = [];

			player.currentMusic.music.status = 1;
			player.saveButtonEnabled = false;

			player.downloadProgress = 1;

			$ionicLoading.show({ template: spinner + 'Download sendo realizado...', noBackdrop: true, duration:2000, animation: 'fade-in' });

			player.currentMusic.tracks.forEach(function (entry){
		        promises.push(configService.changeMusicConfig(auth.token, entry.id, entry.level, entry.pan, entry.enabled, entry.solo));
			});


	        $q.all(promises).then(

	            function(response) { 

	            	console.log("Music config was successfully created. Starting download");

					msCordovaPluginPlayer.download(player.currentMusic.music.musicId, ms_hostname + "/MultiSongs/api/download/music/mix/ogg/" + auth.token + "/" + player.currentMusic.music.musicId, 
						function(message){
							console.log(message)
						}, 
						function(error){
							console.log(error);
							$interval.cancel(intervalToCheckDownload);
							player.currentMusic.music.status = 0;
						}
					);

					player.downloadStarted = false;

					intervalToCheckDownload = $interval(
						function(){
							msCordovaPluginPlayer.checkDownloadPercentage(

								function(message){

									player.downloadStarted = true;

									if (message.readyToStart == true){

										if (message.songId == player.currentMusic.music.musicId){

											if (message.percentage > 0 && !player.downloadStarted){
												//$ionicLoading.hide();
												//$ionicLoading.show({ template: spinner + 'Download sendo realizado!<br/><progress id="_progressbar" max="100" style="width: 150px;" value="{{ msPlayer.getPlayer().downloadProgress}}"> </progress>', noBackdrop: true});
											}

											if (message.percentage == 1 || message.stillDownloading == false){

												player.downloadStarted = false;
												$interval.cancel(intervalToCheckDownload);
												player.currentMusicWasSuccessfullyDownloaded = message.percentage == 1;
												player.downloadProgress = 0;
												$ionicLoading.hide();
												$ionicLoading.show({ template: spinner + 'Sua playback já está disponível em \'Músicas\'!', animation: 'fade-in', noBackdrop: true, duration:2000});
												player.currentMusic.status = 1;

											}else if (message.stillDownloading == true){
												player.downloadProgress = message.percentage * 100
												document.getElementById("_progressbar").value = player.downloadProgress;
											}

										}

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
					250);

	            }

	        );


		},

		changePosition: function(){

			calculateTimeAsString();

			if (player.seekInterval != null){
				$interval.cancel(player.seekInterval);
				player.seekInterval = null;
			}


			if (player.status == STATUS_PLAYING){
				//handleEvent({type : EVENT_SEEKING, caller : 'changePosition', success : true});
				
			}

			player.seekInterval = $interval(function(){

				player.seekInterval = null;

				msCordovaPluginPlayer.seek(parseInt(player.currentTime), function(obj){
					//handleEvent({type : EVENT_PAUSED, caller : 'changePosition', success : true});
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
