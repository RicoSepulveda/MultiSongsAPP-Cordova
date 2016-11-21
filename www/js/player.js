module.factory('msPlayer', function($interval, $q, $cordovaFileTransfer, $cordovaFile, $http, musicService, setlistService){

	var buffers = [];
	var promisses = [];
	var context = new AudioContext();
	//var _click = {};

	var gainNodeMaster;
	var panNodeMaster;
	var analyserNodeMaster;
	var analyserNodeBufferLength;

	var currentMusicDetails;
	var _currentStatus;

	var IS_STOPED_STATUS = 0;
	var IS_LOADING_STATUS = 1;
	var IS_PLAYING_STATUS = 2;
	var IS_SUSPENDED_STATUS = 3;
	var IS_UNAVAILABLE_STATUS = 4;
	var IS_CHANGING_POSITION_STATUS = 5;

	var intervalToMusicPosition;
	var intervalToLeds;
	var intervalToRemoveMasterMessage;
	//var intervalToClick;

	var secondsUntilNow;

	var _lastMainDecibels = 128;
	var _minDecibels = -100;
	var _maxDecibels = 0;
	var _fftSize = 256;

	var _token;

	var _fileSystem;

	var _lastPositionCopied;

	var setCurrentMusic = function($q, $scope, token, musicId, autoPlay){

		var promisses;

		promisses = [];

		$scope.timeToNext = -1;

		promisses.push(musicService.getMusicDetails($scope, token, musicId));

		$q.all(promisses).then(

            function(response) { 

   				$scope.musicDetails = response[0].bean;

                loadTracks($scope, $q, response[0].bean, token, autoPlay);

            },

            function() { 
                $scope.debugTxt = 'Failed'; 
                $scope.msPlayer = {status: IS_UNAVAILABLE_STATUS};
            }

        ).finally(function() {

        });

	};


	var calculateTimeAsString = function(scope){

		var minutes = Math.floor((secondsUntilNow) / 60);
		var seconds = secondsUntilNow - minutes * 60;

		if ((seconds + "").length == 1){
			seconds = "0" + seconds;
		}

		currentMusicDetails.currentTimeAsString = minutes + ":" + seconds;

	};

	var intervalFunction = function($scope){

		secondsUntilNow++;

		$scope.timer.value = (parseFloat($scope.timer.value) + 100 / currentMusicDetails.totalTimeInSeconds);

		calculateTimeAsString($scope);

		if (parseFloat($scope.timer.value) >= 100){

			if ($scope.setlistMusics === null){

				onEnded($scope);

			} else {

				if (getIndexInPlaylist($scope) < $scope.setlistMusics.length - 1){
					
					onEnded($scope);
					setCurrentMusic($q, $scope, _token, $scope.setlistMusics[getIndexInPlaylist($scope) + 1].musicId, $scope.setlistMusics[getIndexInPlaylist($scope) + 1].inicio == 0);
					
					$scope.msPlayer.nextMusic = $scope.setlistMusics[getIndexInPlaylist($scope) + 1].musicName;


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

		var ledIdx;

		_lastMainDecibels = getDecibels(analyserNodeMaster, _lastMainDecibels);

		ledIdx = Math.floor((_lastMainDecibels - 128)/ 4);

		if (ledIdx > 13){
			ledIdx = 13;
		}

		if (ledIdx < 0){
			ledIdx = 0;
		}

		$scope.leds.left = "img/level-led-" + ledIdx + ".png";
		$scope.leds.right = "img/level-led-" + ledIdx + ".png";

		buffers.forEach(function (entry){
			
			entry.lastDecibels = getDecibels(entry.analyserNode, entry.lastDecibels);
			
			ledIdx = Math.floor((entry.lastDecibels - 128)/ 4);

			if (ledIdx > 13){
				ledIdx = 13;
			}

			if (ledIdx < 0){
				ledIdx = 0;
			}

			entry.track.leds.left = "img/level-led-" + ledIdx + ".png";
			entry.track.leds.right = "img/level-led-" + ledIdx + ".png";

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

		var nextMusicIndex;

		$scope.msPlayer.status = IS_STOPED_STATUS; 
		_currentStatus = IS_STOPED_STATUS;
		$scope.timer.value = 0; 

		$interval.cancel(intervalToMusicPosition);
		$interval.cancel(intervalToLeds);
		//$interval.cancel(intervalToClick);

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

			});

	};

	var loadTracks = function($scope, $q, musicDetails, token, autoplay){

			if (_currentStatus == IS_SUSPENDED_STATUS){
				context.resume();
			}

			if (buffers.length > 0){

				if (_currentStatus == IS_PLAYING_STATUS){

					buffers.forEach(function (entry){

						entry.source.stop(0);

					});

				}

				buffers = [];
				promisses = [];

			};

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

			$scope.msPlayer = {status: IS_LOADING_STATUS, masterLevel: 0.8, masterPan: 0, timeToNext: -1, message: "", showMessage: false, nextMusic : ""};
			$scope.timer = {value: 0};

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

            //createClickNode();

			musicDetails.tracks.forEach(function (entry){
				promisses.push(loadMP3($scope, $q, entry, token, musicDetails.status != 1));
			});

			$q.all(promisses).then(

	            function(response) { 

	                buffers = response;

	                $scope.msPlayer.status = IS_STOPED_STATUS;
	                _currentStatus = IS_STOPED_STATUS;

	                if (autoplay){
	                	play($scope);
	                }

	            },

	            function() { 
	                $scope.debugTxt = 'Failed'; 
	                $scope.msPlayer.status = IS_UNAVAILABLE_STATUS;
	                _currentStatus = IS_UNAVAILABLE_STATUS;
	            }

	        ).finally(function() {

	        });

		};

    var loadFile = function ($scope, track, url, callback){

        var getSound = new XMLHttpRequest();
        var finalURL;

        if (_fileSystem != null){

	        getSound.open("GET", _fileSystem + track.id + ".part", true);

	        getSound.responseType = "arraybuffer";	

	        getSound.onload = function() {

				console.log("Carregou arquivo do disco. Vai decodificar.");

	        	decodeAudioData(track, getSound.response, callback, true);

	        };

	        getSound.onerror = function(){

		        	getSound = new XMLHttpRequest();

					console.log("Nao foi possivel carregar arquivo do local Storage. Chamando " + url);

			        getSound.responseType = "arraybuffer";

			        getSound.open("GET", url, true);

			        getSound.onload = function() {

						console.log("Arquivo carregado da URL com sucesso.");
			        	decodeAudioData(track, getSound.response, callback, false);

			        };

			        getSound.send();

	        }

	        getSound.send();

        } else {

        	getSound = new XMLHttpRequest();

			console.log("LocalStorage == null. Chamando " + url);

	        getSound.responseType = "arraybuffer";


	        getSound.open("GET", url, true);

	        getSound.onload = function() {

				console.log("Arquivo carregado da URL com sucesso.");
	        	decodeAudioData(track, getSound.response, callback, false);
	        };

	        getSound.send();

		}



    }

var bfr;

    var createNodes = function(track, data, index, callback){

        var playSound = context.createBufferSource();
        var gainNode = context.createGain();
        var panNode = context.createStereoPanner();
        var analyserNode = context.createAnalyser();

        var result;

        if (!track.result){

			result = {source : {}, gainNode : {}, panNode : {}, bufferSource : [], panNode : [], gainNode : [], analyserNode : [], lastDecibels : 0, buffer : [], track : {}};

			bfr = context.createBuffer(2, Math.floor((144 * 320000 / 44100) * 10000), context.sampleRate);

	        //playSound.buffer = bfr;

	        playSound.connect(panNode);
	        panNode.connect(gainNode);
	        gainNode.connect(analyserNode);
	        analyserNode.connect(panNodeMaster);

	        analyserNode.fftSize = _fftSize;
	        analyserNode.minDecibels = _minDecibels;
			analyserNode.maxDecibels = _maxDecibels;

        }else{
        	result = track.result;
        }


	    result.source = {start : function(startingPoint, finalPoint){
			result.bufferSource[0].start(startingPoint, finalPoint);
	    }, stop : function(moment){
	    	result.bufferSource[0].stop(moment);
	    }};

        result.bufferSource[index] = playSound;
        result.panNode[index] = panNode;
        result.gainNode[index] = gainNode;
        result.analyserNode[index] = analyserNode;

		var startPosition;

        if (index == 0){
			_lastPositionCopied = 0;
        }

		startPosition = _lastPositionCopied;

		if (startPosition < 0){
			startPosition = 0;
		}

		var leftArray = new Float32Array;
		var rightArray = new Float32Array;
/*
		data.copyFromChannel(leftArray,0,0);
		data.copyFromChannel(rightArray,1,0);
*/
/*
		leftArray = data.getChannelData(0);
		rightArray = data.getChannelData(1);
*/	

//result.bufferSource[0].buffer.getChannelData(0).set(data.getChannelData(0), startPosition);
//result.bufferSource[0].buffer.getChannelData(1).set(data.getChannelData(1), startPosition);

        //result.bufferSource[0].buffer.copyToChannel(data.getChannelData(0), 0, startPosition);
        //result.bufferSource[0].buffer.copyToChannel(data.getChannelData(1), 1, startPosition);

        bfr.copyToChannel(data.getChannelData(0), 0, 0);
        bfr.copyToChannel(data.getChannelData(1), 1, 0);

		_lastPositionCopied = _lastPositionCopied + data.length;

console.log("index: " + index + "startPosition: " + startPosition + "; lastPosition: " + _lastPositionCopied);
        result.lastDecibels = 128;

        result.buffer[index] = data;

        result.track = track;

        track.result = result;

if (index == 100){
	console.log("configurou buffer...");
result.bufferSource[0].buffer = bfr;
}

        // Se nao for o primeiro node, conecta o node anterior ao ultimo adicionado para que o ultimo adicionado inicie a tocar quando o anterior terminar
        if (index > 0){
/*
	        result.bufferSource[index-1].onended = function(){
	       // 	result.bufferSource[index].start(0);
	        }
*/
        }

        // Se for o primeiro node, ja libera player para tocar
        if (index == 0){

        	console.log("processou o primeiro node");

			track.leds = {left: "img/level-led-0.png", right: "img/level-led-0.png"};
			track.isLoaded = true;

			result.gainNode = gainNode;
			result.panNode = panNode;
			result.analyserNode = analyserNode;

	        result.gainNode.gain.value = track.level;
	        result.panNode.pan.value = track.pan;

	        if (callback){
	        	callback(result, index);
			}

        }

	};


    var decodeAudioData = function(track, data, callback, isDecoded){

    	var bitrate = currentMusicDetails.bits * 1000;
    	var sampleRate = 44100;
    	var framesPerSecond = 1000 / 26;
    	var packageTime = 2; // Tamanho do pacote em segundos
    	var tempBuffers = [];
    	var delta;
    	var idx;
    	var frameSize;
    	var header;
    	var blockRead;

    	var sync;
    	var id;
    	var layer;
    	var protBit;
    	var bitrate;
    	var frequency;
    	var paddingBit;
    	var blockInitialPosition;

		blockInitialPosition = 0;
    	blockRead = 0;
    	delta = 0;
    	idx = 0;

    	startingPoint = 0;

    	var dataView = new DataView(data);
    	var newDataView;

		header = dataView.getUint32(0).toString(2);

		while (delta < data.byteLength){

			startingPoint = delta;

			header = dataView.getUint32(startingPoint).toString(2);

			sync = header.substring(0, 12);
			id = header.substring(12, 13);
			layer = header.substring(13, 15);
			protBit = header.substring(15, 16);
			bitrate = header.substring(16, 20);
			frequency = header.substring(20, 22);
			paddingBit = header.substring(22, 23);

			frameSize = Math.floor(144 * 320000 / 44100) + parseInt(paddingBit);

			finalPoint = startingPoint + frameSize;

			if (finalPoint > data.byteLength){
				finalPoint = data.byteLength;
			}
/*
			console.log("sync: " + sync);
			console.log("id: " + id);
			console.log("layer: " + layer);
			console.log("prot. bit: " + protBit);
			console.log("bit rate: " + bitrate);
			console.log("frequency: " + frequency);
			console.log("paddingBit: " + paddingBit);
			console.log("frameSize: " + frameSize);
			console.log("init: " + startingPoint);
			console.log("end: " + finalPoint)
*/
//			newDataView = new DataView(data.slice(startingPoint, finalPoint));

//			console.log("startingPoint: " + startingPoint + "; finalPoint: " + finalPoint + "; size: " + frameSize + "; sync: " + newDataView.getUint16(0).toString(16));


if (blockRead == 50){
	tempBuffers.push(data.slice(blockInitialPosition, finalPoint));
	console.log("blockInitialPosition: " + blockInitialPosition + "; finalPoint: " + finalPoint);
	blockRead = 0;
	blockInitialPosition = finalPoint;
}

blockRead++;

/*

			if (idx > 0 && idx % 10 == 0 || finalPoint == data.byteLength){
				console.log("init: " + nextFirstPosition + "; end: " + finalPoint);
				tempBuffers.push(data.slice(nextFirstPosition, finalPoint + 1));

				if (nextFirstPosition == 0){
					playSound.buffer = context.createBuffer(2, 1000000, context.sampleRate);
				}

				context.decodeAudioData(data.slice(nextFirstPosition, finalPoint), function(buffer){

					playSound.buffer.getChannelData(0).set(buffer.getChannelData(0), buffer.length);
					playSound.buffer.getChannelData(1).set(buffer.getChannelData(1), buffer.length);

				});

				nextFirstPosition = finalPoint + 1;

			}
*/
//			tempBuffers.push(data.slice(startingPoint, finalPoint + 1000));

			delta = finalPoint;

			idx++;


		}
console.log("QTDE => " + idx);

		recursiveAudioDecoder(track, tempBuffers, 0, callback, data);

    };

    var recursiveAudioDecoder = function(track, tempBuffers, index, callback, data){


    	var sync;
    	var id;
    	var layer;
    	var protBit;
    	var bitrate;
    	var frequency;
    	var paddingBit;
    	var dataView = new DataView(tempBuffers[index]);

//    	x = data.slice(0, 1044 * 2);

    	var header;

			header = dataView.getUint32(0).toString(2);

			sync = header.substring(0, 12);
			id = header.substring(12, 13);
			layer = header.substring(13, 15);
			protBit = header.substring(15, 16);
			bitrate = header.substring(16, 20);
			frequency = header.substring(20, 22);
			paddingBit = header.substring(22, 23);

			console.log("sync: " + sync);
			console.log("id: " + id);
			console.log("layer: " + layer);
			console.log("prot. bit: " + protBit);
			console.log("bit rate: " + bitrate);
			console.log("frequency: " + frequency);
			console.log("paddingBit: " + paddingBit);
			console.log("tempBuffers[].length: " + tempBuffers[index].byteLength);
			console.log("tempBuffers[LAST]: " + dataView.getUint16(1042).toString(16));
/*
			if (tempBuffers.length > index){
				recursiveAudioDecoder(track, tempBuffers, ++index, callback);
			}
*/

		context.decodeAudioData(tempBuffers[index], function(buffer){

			console.log("Terminou mais um: " + index);

			createNodes(track, buffer, index, callback);

			if (++index < tempBuffers.length){
				recursiveAudioDecoder(track, tempBuffers, index, callback);
			}

        });

    }

    var play = function($scope){

		if (_currentStatus == IS_SUSPENDED_STATUS){
			context.resume();
		}

		$scope.msPlayer.status = IS_PLAYING_STATUS;
		_currentStatus = IS_PLAYING_STATUS;

       	buffers.forEach(function (entry){
			entry.source.start(0, (currentMusicDetails.totalTimeInSeconds / 100) * $scope.timer.value);
		});

		intervalToMusicPosition = $interval(function(){intervalFunction($scope);}, 1000, currentMusicDetails.totalTimeInSeconds + 1);
		intervalToLeds = $interval(function(){calculateLeds($scope);}, 50, currentMusicDetails.totalTimeInSeconds * 1000 / 50);

    };


	var loadMP3 = function($scope, $q, track, token, isDemo){

		var deferred = $q.defer();
		var url;
		
        var result = {};

        var ms_hostname = window.localStorage.getItem("environment");
isDemo = false;
        url = ms_hostname + "/MultiSongs/api/download/music/" + token + "/" + track.id + "/" + isDemo;

        track.instrumentDisabledImagePath = track.instrumentImagePath + "-disabled.jpg";
        track.instrumentEnabledImagePath = track.instrumentImagePath + ".jpg";

        track.isLoaded = false;

        loadFile($scope, track, url, function(result, index){

            deferred.resolve(result);

        });

		return deferred.promise;

	};

	return {

		loadSetlist: function(fileSystem, $scope, $q, token, setlistId){

			var promisses;

			_fileSystem = fileSystem;

			_token = token;

			promisses = [];

			promisses.push(setlistService.getSetlistDetail($scope, token, setlistId));

			$q.all(promisses).then(

	            function(response) { 

	                $scope.setlistMusics = response[0].musics;

					$scope.setlistName = response[0].title;
					$scope.setlistTime = response[0].totalTime;
					$scope.setlistId = response[0].id;

					setCurrentMusic($q, $scope, token, $scope.setlistMusics[0].musicId, $scope.setlistMusics[0].inicio == 0);

	            },

	            function() { 
	                $scope.debugTxt = 'Failed'; 
	                $scope.msPlayer = {status: IS_UNAVAILABLE_STATUS};
	            }

	        ).finally(function() {

	        });

			

		},


		setCurrentMusic: function($q, $scope, token, musicId){

			setCurrentMusic($q, $scope, token, musicId, false);

			
		},

		loadMusic: function(fileSystem, $scope, $q, musicDetails, token){

			console.log("Loading music." + musicDetails);

			$scope.musicDetails = musicDetails;

			_fileSystem = fileSystem;

			musicDetails.progress = 0;

			$scope.setlistMusics = null;

			loadTracks($scope, $q, musicDetails, token);

		},

		changeLevel: function($scope, track){

			buffers.forEach(function (entry){

				if (entry.track.id == track.id){

					entry.gainNode.gain.value = track.level;

					entry.track.showMessage = true;

					if (track.level == 0){
						entry.track.message = "Off";
					}else if (track.level == 1){
						entry.track.message = "Max"; 
					}else{
						entry.track.message = parseInt(track.level * 100) + "%";
					}


					if (entry.intervalToRemoveMessage){
						$interval.cancel(entry.intervalToRemoveMessage);
					}

					entry.intervalToRemoveMessage = $interval(function(){entry.track.showMessage = false;}, 2000, 1);

				}

			});

		},

		changeMasterLevel: function($scope){

			gainNodeMaster.gain.value = $scope.msPlayer.masterLevel;

				$scope.msPlayer.showMessage = true;

				if (gainNodeMaster.gain.value == 0){
					$scope.msPlayer.message = "Off";
				}else if (gainNodeMaster.gain.value == 1){
					$scope.msPlayer.message = "Max"; 
				}else{
					$scope.msPlayer.message = parseInt(gainNodeMaster.gain.value * 100) + "%";
				}


				if (intervalToRemoveMasterMessage){
					$interval.cancel(intervalToRemoveMasterMessage);
				}

				intervalToRemoveMasterMessage = $interval(function(){$scope.msPlayer.showMessage = false;}, 2000, 1);

		},

		changeMasterPan: function($scope){

			panNodeMaster.pan.value = $scope.msPlayer.masterPan;

			$scope.msPlayer.showMessage = true;

			if (panNodeMaster.pan.value > 0 && panNodeMaster.pan.value < 1){
				$scope.msPlayer.message = parseInt(panNodeMaster.pan.value * 100) + "%R";
			}

			if (panNodeMaster.pan.value == 0){
				$scope.msPlayer.message = "LR";
			}

			if (panNodeMaster.pan.value < 0 && panNodeMaster.pan.value > -1){
				$scope.msPlayer.message = parseInt(-1 * panNodeMaster.pan.value * 100) + "%L";
			}

			if (panNodeMaster.pan.value == -1){
				$scope.msPlayer.message = "LFT";
			}

			if (panNodeMaster.pan.value == 1){
				$scope.msPlayer.message = "RGT";
			}

			if (intervalToRemoveMasterMessage){
				$interval.cancel(intervalToRemoveMasterMessage);
			}

			intervalToRemoveMasterMessage = $interval(function(){$scope.msPlayer.showMessage = false;}, 2000, 1);

		},

		changePan: function($scope, track){

			buffers.forEach(function (entry){

				if (entry.track.id == track.id){

					entry.panNode.pan.value = track.pan;

					entry.track.showMessage = true;

					if (track.pan > 0 && track.pan < 1){
						entry.track.message = parseInt(track.pan * 100) + "%R";
					}
					if (track.pan == 0){
						entry.track.message = "LR";
					}
					if (track.pan < 0 && track.pan > -1){
						entry.track.message = parseInt(-1 * track.pan * 100) + "%L";
					}
					if (track.pan == -1){
						entry.track.message = "LFT";
					}
					if (track.pan == 1){
						entry.track.message = "RGT";
					}

					if (entry.intervalToRemoveMessage){
						$interval.cancel(entry.intervalToRemoveMessage);
					}

					entry.intervalToRemoveMessage = $interval(function(){entry.track.showMessage = false;}, 2000, 1);

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

			play($scope);
			//intervalToClick = $interval(playClick, 500, 2000);

		},

		new: function($scope){

			if (buffers){

				console.log("buffers.length: " + buffers.length);

				buffers.forEach(function (entry){

					try {
						entry.source.stop(0);
					} catch (err) {

					}

				});

			}

			buffers = [];
			promisses = [];

			$interval.cancel(intervalToMusicPosition);
			$interval.cancel(intervalToLeds);
			//$interval.cancel(intervalToClick);

		},

		resume: function($scope){

			if (_currentStatus == IS_SUSPENDED_STATUS){
				intervalToMusicPosition = $interval(function(){intervalFunction($scope);}, 1000, currentMusicDetails.totalTimeInSeconds + 1);
				intervalToLeds = $interval(function(){calculateLeds($scope);}, 50, currentMusicDetails.totalTimeInSeconds * 1000 / 50);
				//intervalToClick = $interval(playClick, 500, 2000);
				context.resume();
			}

			$scope.msPlayer.status = IS_PLAYING_STATUS;
			_currentStatus = IS_PLAYING_STATUS;

		},

		suspend: function($scope){

			$scope.msPlayer.status = IS_SUSPENDED_STATUS;
			_currentStatus = IS_SUSPENDED_STATUS;

			$interval.cancel(intervalToMusicPosition);
			$interval.cancel(intervalToLeds);
			//$interval.cancel(intervalToClick);

			context.suspend();

			$scope.leds.left = "img/level-led-0.png";
			$scope.leds.right = "img/level-led-0.png";

			buffers.forEach(function (entry){

				entry.track.leds.left = "img/level-led-0.png";
				entry.track.leds.right = "img/level-led-0.png";

			});

		},

/*
		download: function($scope){

			downloadFile($scope);

        },
*/
		download: function($scope){

			var url;
			var targetPath;

			//$scope.debugTxt2 = "preparando...";

			currentMusicDetails.isDownloading = true;
			currentMusicDetails.status = 1;

			var ms_hostname = window.localStorage.getItem("environment");

			buffers.forEach(function (entry){

				url = ms_hostname + "/MultiSongs/api/download/music/" + token + "/" + entry.track.id + "/" + false;
				targetPath = _fileSystem + entry.track.id + ".part";

				//$scope.debugTxt2 = "lendo arquivo...";

				$cordovaFileTransfer.download(url, targetPath, {}, true).
				then(function (result) {

					entry.wasDownloaded = true;
					entry.isDownloading = false;

					currentMusicDetails.wasDownloaded = true;
					currentMusicDetails.isDownloading = false;

					buffers.forEach(function (entry2){
						currentMusicDetails.isDownloading |= entry2.isDownloading;
						currentMusicDetails.wasDownloaded &= entry2.wasDownloaded;
					});	


					//$scope.debugTxt2 = "finalmente!!";
				}, function (error) {

					entry.wasDownloaded = false;
					entry.isDownloading = false;

					currentMusicDetails.wasDownloaded = false;
					currentMusicDetails.isDownloading = entry.isDownloading;

					buffers.forEach(function (entry2){
						currentMusicDetails.isDownloading |= entry2.isDownloading;
					});	


					//$scope.debugTxt2 = "foi mas deu erro...";
				}, function (progress) {
					entry.progress = parseInt((progress.loaded / progress.total) * 100);
					
					var pgrs = 0;

					buffers.forEach(function (entry2){
						pgrs += entry2.progress;
					});	

					currentMusicDetails.progress = pgrs;

					//$scope.debugTxt2 = parseInt((progress.loaded / progress.total) * 100) + "%";
					// PROGRESS HANDLING GOES HERE
				});

			});

		},

/*
		download: function($scope){

			var fileTransfer = new FileTransfer();

			var uri;

			buffers.forEach(function (entry){

				uri = "http://www.multisongs.audio/MultiSongs/api/download/music/" + token + "/" + entry.track.id + "/" + false;

				fileTransfer.download(
				    uri,
				    _fileSystem + entry.track.id + ".part",
				    downloadFinishedSuccess,
				    downloadFinishedError,
				    false,
				    {
				        headers: {
				            "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
				        }
				    }
				);

			});
		},
*/
		changePosition: function($scope){

            var previousStatus;

            previousStatus = _currentStatus;

            $scope.msPlayer.status = IS_CHANGING_POSITION_STATUS;
            _currentStatus = IS_CHANGING_POSITION_STATUS;

            if (previousStatus == IS_PLAYING_STATUS || previousStatus == IS_SUSPENDED_STATUS){

				buffers.forEach(function (entry){

					entry.source.stop(0);

				});

            }

            if (previousStatus == IS_PLAYING_STATUS){

            	$interval.cancel(intervalToMusicPosition);
            	$interval.cancel(intervalToLeds);
				//$interval.cancel(intervalToClick);

				intervalToMusicPosition = $interval(function(){intervalFunction($scope);}, 1000, currentMusicDetails.totalTimeInSeconds + 1);
            	intervalToLeds = $interval(function(){calculateLeds($scope);}, 50, currentMusicDetails.totalTimeInSeconds * 1000 / 50);
				//intervalToClick = $interval(playClick, 500, 2000);

            }

            refreshBuffers($scope, (previousStatus == IS_PLAYING_STATUS || previousStatus == IS_SUSPENDED_STATUS));

			secondsUntilNow = Math.floor(parseFloat($scope.timer.value) * currentMusicDetails.totalTimeInSeconds / 100);

			if (currentMusicDetails.status != 1){
				if (currentMusicDetails.demoStartingTime == "00:30"){
					secondsUntilNow = secondsUntilNow + 30;
				}else{
				}
				
			};

			calculateTimeAsString($scope);

			$scope.msPlayer.status = previousStatus;
			_currentStatus = previousStatus;

		}

	}

});