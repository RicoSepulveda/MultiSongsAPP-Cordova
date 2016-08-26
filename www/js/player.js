module.factory('msPlayer', function($interval, $q, musicService, setlistService){

	var buffers = [];
	var promisses = [];
	var context = new AudioContext();

	var gainNodeMaster;
	var panNodeMaster;
	var analyserNodeMaster;
	var analyserNodeBufferLength;

	var currentMusicDetails;

	var IS_STOPED_STATUS = 0;
	var IS_LOADING_STATUS = 1;
	var IS_PLAYING_STATUS = 2;
	var IS_SUSPENDED_STATUS = 3;
	var IS_UNAVAILABLE_STATUS = 4;
	var IS_CHANGING_POSITION_STATUS = 5;

	var intervalToMusicPosition;
	var intervalToLeds;

	var secondsUntilNow;

	var _lastMainDecibels = 128;
	var _minDecibels = -90;
	var _maxDecibels = -10;
	var _fftSize = 256;

	var _token;

	var setCurrentMusic = function($q, $scope, token, musicId){

		var promisses;

		promisses = [];

		$scope.timeToNext = -1;

		promisses.push(musicService.getMusicDetails($scope, token, musicId));

		$q.all(promisses).then(

            function(response) { 

                loadTracks($scope, $q, response[0], token);

            },

            function() { 
                $scope.debugTxt = 'Failed'; 
                $scope.msPlayer = {status: IS_UNAVAILABLE_STATUS};
            }

        ).finally(function() {

        });

	};



	var intervalFunction = function($scope){

		//calculateLeds($scope);

		secondsUntilNow++;

		$scope.timer.value = (parseFloat($scope.timer.value) + 100 / currentMusicDetails.totalTimeInSeconds);

		var minutes = Math.floor((secondsUntilNow) / 60);
		var seconds = secondsUntilNow - minutes * 60;

		if ((seconds + "").length == 1){
			seconds = "0" + seconds;
		}

		currentMusicDetails.currentTimeAsString = minutes + ":" + seconds;
$scope.debugTxt = parseFloat($scope.timer.value);
		if (parseFloat($scope.timer.value) >= 100){
			//$scope.debugTxt = "status: " + currentMusicDetails.status + "; timer: " + $scope.timer.value + "; totalTime: " + currentMusicDetails.totalTimeInSeconds;
$scope.debugTxt = "Chegou no fim...";

			if ($scope.setlistMusics === null){

				onEnded($scope);

			} else {

				if (getIndexInPlaylist($scope) < $scope.setlistMusics.length - 1){
					$scope.debugTxt = "Carregando proxima...";
					setCurrentMusic($q, $scope, _token, $scope.setlistMusics[getIndexInPlaylist($scope) + 1].musicId);
				} else {
					onEnded($scope);
				}


				
			}

			
		}

		$scope.msPlayer.timeToNext = currentMusicDetails.totalTimeInSeconds - secondsUntilNow;

	};

	var getIndexInPlaylist = function($scope){

		var idx = 0;
		var returnValue;

		$scope.setlistMusics.forEach(function (entry){

			if (entry.musicId == currentMusicDetails.musicId){
				returnValue = idx;
			}

			idx++;

		});

		return returnValue;

	};


	var calculateLeds = function($scope){

		_lastMainDecibels = getDecibels(analyserNodeMaster, _lastMainDecibels);

		//$scope.debugTxt2 = _lastMainDecibels;

		$scope.leds.left = "img/level-led-" + Math.floor((_lastMainDecibels - 128)/ 4) + ".png";
		$scope.leds.right = "img/level-led-" + Math.floor((_lastMainDecibels - 128)/ 4) + ".png";

		buffers.forEach(function (entry){
			entry.lastDecibels = getDecibels(entry.analyserNode, entry.lastDecibels);
			entry.track.leds.left = "img/level-led-" + Math.floor((entry.lastDecibels - 128)/ 4) + ".png";
			entry.track.leds.right = "img/level-led-" + Math.floor((entry.lastDecibels - 128)/ 4) + ".png";
		});

	};

	var getDecibels = function(analyser, lastDecibels){


		var dataArray = new Uint8Array(analyserNodeBufferLength);

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

	}


	var onEnded = function($scope){

		//$scope.debugTxt2 = "Finalizou...";

		var nextMusicIndex;

		$scope.msPlayer.status = IS_STOPED_STATUS; 
		$scope.timer.value = 0; 

		$interval.cancel(intervalToMusicPosition);
		$interval.cancel(intervalToLeds);

		buffers.forEach(function (entry){
			entry.track.leds.left = "img/level-led-0.png";
			entry.track.leds.right = "img/level-led-0.png";
			entry.source.stop(0);
		});

		$scope.leds.left = "img/level-led-0.png";
		$scope.leds.right = "img/level-led-0.png";

		refreshBuffers($scope, false);

		if (currentMusicDetails.status != 1){
			if (currentMusicDetails.demoStartingTime == "00:30"){
				secondsUntilNow = 30;
				currentMusicDetails.currentTimeAsString = "0:30";
			}else{
				secondsUntilNow = 0;
				currentMusicDetails.currentTimeAsString = "0:00";
			}
			
		} else {
			secondsUntilNow = 0;
			currentMusicDetails.currentTimeAsString = "0:00";
		}

		$scope.msPlayer.timeToNext = -1;

		//$scope.debugTxt2 += " - Status: " + $scope.msPlayer.status + "; value: " + $scope.timer.value;

	}

	var refreshBuffers = function($scope, startPlaying){


            var playSound;
            var gainNode;
            var panNode;
            var analyserNode;

	       	buffers.forEach(function (entry){

	            playSound = context.createBufferSource();
	            gainNode = context.createGain();
	            panNode = context.createStereoPanner();
	            analyserNode = context.createAnalyser();

                playSound.connect(panNode);
                panNode.connect(gainNode);
                gainNode.connect(analyserNode);
                analyserNode.connect(panNodeMaster);

	            analyserNode.fftSize = _fftSize;
	            analyserNode.minDecibels = _minDecibels;
				analyserNode.maxDecibels = _maxDecibels;

	            playSound.buffer = entry.buffer;

                //playSound.onended = entry.source.onended;

		        entry.source = playSound;
                entry.panNode = panNode;
                entry.gainNode = gainNode;
                entry.analyserNode = analyserNode;

                entry.gainNode.gain.value = entry.track.level;
                entry.panNode.pan.value = entry.track.pan;

                if (startPlaying){
                	entry.source.start(0, (currentMusicDetails.totalTimeInSeconds / 100) * $scope.timer.value);
                }
/*
                if (previousStatus == IS_PLAYING_STATUS || previousStatus == IS_SUSPENDED_STATUS){
                	entry.source.start(0, (currentMusicDetails.totalTimeInSeconds / 100) * $scope.timer.value);
                }
*/
			});

	};

	var loadTracks = function($scope, $q, musicDetails, token){

			//if (!currentMusicDetails || (currentMusicDetails.id != musicDetails.id)){

				//if ($scope.msPlayer && $scope.msPlayer.status == IS_PLAYING_STATUS){

			if (buffers.length > 0){

				if ($scope.msPlayer && $scope.msPlayer.status == IS_PLAYING_STATUS){

					buffers.forEach(function (entry){

						entry.source.stop(0);

					});

				}

				buffers = [];
				promisses = [];

			};


			//};

			currentMusicDetails = musicDetails;

			if (musicDetails.status != 1){

				musicDetails.finishTime = musicDetails.demoFinishTime;
				musicDetails.totalTimeInSeconds = 30;
				musicDetails.currentTimeAsString = "0:30";

				secondsUntilNow = 30;

			}else{

				musicDetails.finishTime = musicDetails.totalTime;
				musicDetails.currentTimeAsString = "0:00";

				secondsUntilNow = 0;

			}

			$scope.msPlayer = {status: IS_LOADING_STATUS, masterLevel: 0.8, masterPan: 0, timeToNext: -1};
			$scope.timer = {value: 0};

			// $scope.debugTxt2 = "Chamou o loadTracks...";

	        gainNodeMaster = context.createGain();
            panNodeMaster = context.createStereoPanner();
            analyserNodeMaster = context.createAnalyser();

            panNodeMaster.connect(gainNodeMaster);
            gainNodeMaster.connect(analyserNodeMaster);
            analyserNodeMaster.connect(context.destination);

            analyserNodeMaster.fftSize = _fftSize;
            analyserNodeMaster.minDecibels = _minDecibels;
			analyserNodeMaster.maxDecibels = _maxDecibels;

			$scope.leds = {left: "img/level-led-0.png", right: "img/level-led-0.png"};

            analyserNodeBufferLength = analyserNodeMaster.frequencyBinCount;


			musicDetails.tracks.forEach(function (entry){
				promisses.push(loadMP3($scope, $q, entry, token, musicDetails.status != 1));
			});

			$q.all(promisses).then(

	            function(response) { 

	                // $scope.debugTxt2 = $scope.debugTxt2 + "; terminou todos os promisses: " + response.length;

	                buffers = response;

	                $scope.msPlayer.status = IS_STOPED_STATUS;

	            },

	            function() { 
	                $scope.debugTxt = 'Failed'; 
	                $scope.msPlayer.status = IS_UNAVAILABLE_STATUS;
	            }

	        ).finally(function() {

	        });

		};

	var loadMP3 = function($scope, $q, track, token, isDemo){

		// $scope.debugTxt2 = $scope.debugTxt2 + "Chegou no loadMP3...";

		var deferred = $q.defer();
		
        var getSound = new XMLHttpRequest();
        var playSound = context.createBufferSource();
        var gainNode = context.createGain();
        var panNode = context.createStereoPanner();
        var analyserNode = context.createAnalyser();

        var result = {};

        track.instrumentDisabledImagePath = track.instrumentImagePath + "-disabled.jpg";
        track.instrumentEnabledImagePath = track.instrumentImagePath + ".jpg";

        getSound.open("GET", "http://app.multisongs.audio/MultiSongs/api/download/music/" + token + "/" + track.id + "/" + isDemo, true);

        getSound.responseType = "arraybuffer";

        track.isLoaded = false;

        getSound.onload = function() {
        	
            context.decodeAudioData(getSound.response, function(buffer){

                playSound.buffer = buffer;

                playSound.connect(panNode);
                panNode.connect(gainNode);
                gainNode.connect(analyserNode);
                analyserNode.connect(panNodeMaster);

	            analyserNode.fftSize = _fftSize;
	            analyserNode.minDecibels = _minDecibels;
				analyserNode.maxDecibels = _maxDecibels;

                result.source = playSound;
                result.panNode = panNode;
                result.gainNode = gainNode;
                result.analyserNode = analyserNode;

                result.lastDecibels = 128;

                result.track = track;
                result.buffer = buffer;

                result.gainNode.gain.value = track.level;
                result.panNode.pan.value = track.pan;

				track.leds = {left: "img/level-led-0.png", right: "img/level-led-0.png"};

				track.isLoaded = true;

                deferred.resolve(result);

            });

        };

        getSound.send();

		// $scope.debugTxt2 = $scope.debugTxt2 + "Saindo do loadMP3...";

		return deferred.promise;

	};

	return {

		loadSetlist: function($scope, $q, token, setlistId){

			var promisses;

			_token = token;

			promisses = [];

			promisses.push(setlistService.getSetlistDetail($scope, token, setlistId));

			$q.all(promisses).then(

	            function(response) { 

	                $scope.setlistMusics = response[0].musics;

					$scope.setlistName = response[0].title;
					$scope.setlistTime = response[0].totalTime;
					$scope.setlistId = response[0].id;

					setCurrentMusic($q, $scope, token, $scope.setlistMusics[0].musicId);

	            },

	            function() { 
	                $scope.debugTxt = 'Failed'; 
	                $scope.msPlayer = {status: IS_UNAVAILABLE_STATUS};
	            }

	        ).finally(function() {

	        });

			

		},


		setCurrentMusic: function($q, $scope, token, musicId){

			setCurrentMusic($q, $scope, token, musicId);

			
		},

		loadMusic: function($scope, $q, musicDetails, token){

			$scope.setlistMusics = null;

			loadTracks($scope, $q, musicDetails, token);

		},

		changeLevel: function($scope, track){

			// $scope.debugTxt2 = "Mudou nivel. track.level = " + track.level;
			

			buffers.forEach(function (entry){

				if (entry.track.id == track.id){

					entry.gainNode.gain.value = track.level;

				}

			});

		},

		changeMasterLevel: function($scope){

			gainNodeMaster.gain.value = $scope.msPlayer.masterLevel;

		},

		changeMasterPan: function($scope){

			panNodeMaster.pan.value = $scope.msPlayer.masterPan;

		},

		changePan: function($scope, track){
			
			// $scope.debugTxt2 = "Mudou pan. track.pan = " + track.pan;

			buffers.forEach(function (entry){

				if (entry.track.id == track.id){

					entry.panNode.pan.value = track.pan;

				}

			});

		},

		unactivateSolo: function($scope, track){

			var hasSolo = false;

			// Verifica se algum canal esta em solo
			buffers.forEach(function (entry){

				hasSolo = hasSolo | entry.track.solo;

			});

			if (!hasSolo){

				buffers.forEach(function (entry){

					if (entry.track.id != track.id){

						entry.track.enabled = true;
						entry.track.solo = false;
						entry.gainNode.gain.value = entry.track.level;

					}

				});

			} else {

				buffers.forEach(function (entry){

					if (entry.track.id == track.id){

						entry.track.enabled = false;
						entry.track.solo = false;
						entry.gainNode.gain.value = 0;

					}

				});

			}

		},

		activateSolo: function($scope, track){


			buffers.forEach(function (entry){

				if (entry.track.id != track.id){

					if (!entry.track.solo){

						entry.gainNode.gain.value = 0;
						entry.track.enabled = false;

					}

				} else {

					entry.track.enabled = true;
					entry.track.solo = true;
					entry.gainNode.gain.value = track.level;

				}

			});

		},

		mute: function($scope, track){


			buffers.forEach(function (entry){

				if (entry.track.id == track.id){

					entry.gainNode.gain.value = 0;

					entry.track.enabled = false;
				}

			});

		},

		unMute: function($scope, track){


			buffers.forEach(function (entry){

				if (entry.track.id == track.id){

					entry.gainNode.gain.value = track.level;

					entry.track.enabled = true;

				}

			});

		},

		play: function($scope){

			//var onEndedAlreadySet = false;

			if ($scope.msPlayer.status == IS_SUSPENDED_STATUS){
				context.resume();
			}

			$scope.msPlayer.status = IS_PLAYING_STATUS;

	       	buffers.forEach(function (entry){
/*
	       		if (!onEndedAlreadySet){

	       			entry.source.onended = function(){$scope.debugTxt2 = "Finalizou..."; onEnded($scope)};

	       			onEndedAlreadySet = true;

	       		}
*/
				entry.source.start(0, (currentMusicDetails.totalTimeInSeconds / 100) * $scope.timer.value);

			});

			intervalToMusicPosition = $interval(function(){intervalFunction($scope);}, 1000, 2000);
			intervalToLeds = $interval(function(){calculateLeds($scope);}, 50, 2000);

		},

		new: function($scope){

			buffers = [];
			promisses = [];

			$interval.cancel(intervalToMusicPosition);
			$interval.cancel(intervalToLeds);

			//$scope.msPlayer.status = IS_STOPED_STATUS;

		},

		resume: function($scope){

			if ($scope.msPlayer.status == IS_SUSPENDED_STATUS){
				intervalToMusicPosition = $interval(function(){intervalFunction($scope);}, 1000, 2000);
				intervalToLeds = $interval(function(){calculateLeds($scope);}, 50, 2000);
				context.resume();
			}

			$scope.msPlayer.status = IS_PLAYING_STATUS;

		},

		suspend: function($scope){

			$scope.msPlayer.status = IS_SUSPENDED_STATUS;
			$interval.cancel(intervalToMusicPosition);
			$interval.cancel(intervalToLeds);

			context.suspend();

		},

		changePosition: function($scope){

            var previousStatus;

            previousStatus = $scope.msPlayer.status;

            $scope.msPlayer.status = IS_CHANGING_POSITION_STATUS;

            if (previousStatus == IS_PLAYING_STATUS || previousStatus == IS_SUSPENDED_STATUS){

				buffers.forEach(function (entry){

					//entry.source.onended = function(){};

					entry.source.stop(0);

				});

            }

            if (previousStatus == IS_PLAYING_STATUS){

            	$interval.cancel(intervalToMusicPosition);
            	$interval.cancel(intervalToLeds);

            	//$scope.debugTxt2 = "scope -> " + $scope.timer.value + "; " + (100 / currentMusicDetails.totalTimeInSeconds) + "; " + ($scope.timer.value + (100 / currentMusicDetails.totalTimeInSeconds));

				intervalToMusicPosition = $interval(function(){intervalFunction($scope);}, 1000, 2000);
            	intervalToLeds = $interval(function(){calculateLeds($scope);}, 50, 2000);

            }

            refreshBuffers($scope, (previousStatus == IS_PLAYING_STATUS || previousStatus == IS_SUSPENDED_STATUS));

			secondsUntilNow = Math.floor(parseFloat($scope.timer.value) * currentMusicDetails.totalTimeInSeconds / 100);

			if (currentMusicDetails.status != 1){
				if (currentMusicDetails.demoStartingTime == "00:30"){
					secondsUntilNow = secondsUntilNow + 30;
				}else{
				}
				
			};

			intervalFunction($scope);

			$scope.msPlayer.status = previousStatus;

		}

	}

});