module.factory('msPlayer', function($interval){

	var buffers = [];
	var promisses = [];
	var context = new AudioContext();

	var gainNodeMaster;
	var panNodeMaster;

	//var currentMusicDetails;

	var IS_STOPED_STATUS = 0;
	var IS_LOADING_STATUS = 1;
	var IS_PLAYING_STATUS = 2;
	var IS_SUSPENDED_STATUS = 3;
	var IS_UNAVAILABLE_STATUS = 4;
	var IS_CHANGING_POSITION_STATUS = 4;

	var intervalToMusicPosition;

	var onEnded = function($scope){
/*
		if ($scope.msPlayer.status != IS_CHANGING_POSITION_STATUS){

			$scope.msPlayer.status = IS_STOPED_STATUS; 
			$scope.timer.value = 0; 
			$interval.cancel(intervalToMusicPosition);

		};
*/
	}

	var loadMP3 = function($scope, $q, track, token){

		// $scope.debugTxt2 = $scope.debugTxt2 + "Chegou no loadMP3...";

		var deferred = $q.defer();
		
        var getSound = new XMLHttpRequest();
        var playSound = context.createBufferSource();
        var gainNode = context.createGain();
        var panNode = context.createStereoPanner();

        var result = {};

        track.instrumentDisabledImagePath = track.instrumentImagePath + "-disabled.jpg";
        track.instrumentEnabledImagePath = track.instrumentImagePath + ".jpg";

        getSound.open("GET", "http://app.multisongs.audio/MultiSongs/api/download/music/" + token + "/" + track.id, true);

        getSound.responseType = "arraybuffer";

        getSound.onload = function() {
        	
            context.decodeAudioData(getSound.response, function(buffer){

                playSound.buffer = buffer;

                playSound.connect(panNode);
                panNode.connect(gainNode);
                gainNode.connect(panNodeMaster);

                result.source = playSound;
                result.panNode = panNode;
                result.gainNode = gainNode;
                result.track = track;
                result.buffer = buffer;

                result.gainNode.gain.value = track.level;
                result.panNode.pan.value = track.pan;

                deferred.resolve(result);

            });

        };

        getSound.send();

		// $scope.debugTxt2 = $scope.debugTxt2 + "Saindo do loadMP3...";

		return deferred.promise;

	};

	return {

		loadTracks: function($scope, $q, musicDetails, token){

			//if (!currentMusicDetails || (currentMusicDetails.id != musicDetails.id)){

				//if ($scope.msPlayer && $scope.msPlayer.status == IS_PLAYING_STATUS){

			if (buffers.length > 0){

				buffers.forEach(function (entry){

					entry.source.stop(0);

				});

				buffers = [];
				promisses = [];

			};


			//};

			//currentMusicDetails = musicDetails

			$scope.msPlayer = {status: IS_LOADING_STATUS, masterLevel: 0.8, masterPan: 0};
			$scope.timer = {value: 0};

			// $scope.debugTxt2 = "Chamou o loadTracks...";

	        gainNodeMaster = context.createGain();
            panNodeMaster = context.createStereoPanner();

            panNodeMaster.connect(gainNodeMaster);
            gainNodeMaster.connect(context.destination);

			musicDetails.tracks.forEach(function (entry){
				promisses.push(loadMP3($scope, $q, entry, token));
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

			var onEndedAlreadySet = false;

			if ($scope.msPlayer.status == IS_SUSPENDED_STATUS){
				context.resume();
			}

			$scope.msPlayer.status = IS_PLAYING_STATUS;

	       	buffers.forEach(function (entry){

	       		if (!onEndedAlreadySet){

	       			//entry.source.onended = function(){onEnded($scope)};

	       			onEndedAlreadySet = true;

	       		}

				entry.source.start(0, (240 / 100) * $scope.timer.value);

			});

			intervalToMusicPosition = $interval(function(){$scope.timer.value++;}, 240 * 1000 / 100, 100 - $scope.timer.value);

		},

		new: function($scope){

			buffers = [];
			promisses = [];

			$interval.cancel(intervalToMusicPosition);

			//$scope.msPlayer.status = IS_STOPED_STATUS;

		},

		resume: function($scope){

			if ($scope.msPlayer.status == IS_SUSPENDED_STATUS){
				intervalToMusicPosition = $interval(function(){$scope.timer.value++;}, 240 * 1000 / 100, 100 - $scope.timer.value);
				context.resume();
			}

			$scope.msPlayer.status = IS_PLAYING_STATUS;

		},

		suspend: function($scope){

			$scope.msPlayer.status = IS_SUSPENDED_STATUS;
			$interval.cancel(intervalToMusicPosition);

			context.suspend();

		},

		changePosition: function($scope){

            var playSound;
            var gainNode;
            var panNode;

            var previousStatus;

            previousStatus = $scope.msPlayer.status;

            $scope.msPlayer.status = IS_CHANGING_POSITION_STATUS;

            if (previousStatus == IS_PLAYING_STATUS || previousStatus == IS_SUSPENDED_STATUS){

				buffers.forEach(function (entry){

					entry.source.stop(0);

				});

            }

            if (previousStatus == IS_PLAYING_STATUS){

            	$interval.cancel(intervalToMusicPosition);

				intervalToMusicPosition = $interval(function(){$scope.timer.value++;}, 240 * 1000 / 100, 100 - $scope.timer.value);
            
            }

	       	buffers.forEach(function (entry){

	            playSound = context.createBufferSource();
	            gainNode = context.createGain();
	            panNode = context.createStereoPanner();

	            playSound.buffer = entry.buffer;

                playSound.connect(panNode);
                panNode.connect(gainNode);
                gainNode.connect(panNodeMaster);

                playSound.onended = entry.source.onended;

		        entry.source = playSound;
                entry.panNode = panNode;
                entry.gainNode = gainNode;

                entry.gainNode.gain.value = entry.track.level;
                entry.panNode.pan.value = entry.track.pan;

                if (previousStatus == IS_PLAYING_STATUS || previousStatus == IS_SUSPENDED_STATUS){
                	entry.source.start(0, (240 / 100) * $scope.timer.value);
                }

			});

			$scope.msPlayer.status = previousStatus;

		}

	}

});