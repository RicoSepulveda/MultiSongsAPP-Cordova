module.factory('msCordovaPluginPlayer', function(){

	var isPlaying = false;

	return {

		configPlayer : function(config, musicId, isDemo, artistName, songName, fileDirectory, mode, isMultitrack, onSuccessCallback, onErrorCallback){

			var configuration = [];

			//configuration[0] = {demoMode : isDemo, khz : khz, encode : encode, channels : channels, fileDirectory : fileDirectory};
			configuration[0] = {musicId : musicId, mode : mode, config : config, demoMode : isDemo, multitrack : isMultitrack, artistName : artistName, songName : songName, fileDirectory : fileDirectory};

	        cordova.exec(
	        	function(message){
	        		onSuccessCallback(message);
	        	}, 
	        	function(error){
	        		onErrorCallback(error);
	        	}, 
	        	"MultiSongsPlugin", 
	        	"config", 
	        	configuration);

/*
	        cordova.exec(
	        	function(message){

			        cordova.exec(
			        	function(message){
			        		onSuccessCallback(message);
			        	}, 
			        	function(error){
			        		onErrorCallback(error);
			        	}, 
			        	"MultiSongsPlugin", 
			        	"load", 
			        	uriObjects);

	        	}, 
	        	function(error){
	        		onErrorCallback(error);
	        	}, 
	        	"MultiSongsPlugin", 
	        	"config", 
	        	configuration);
*/		
		},

		unload : function(onSuccessCallback, onErrorCallback){

	        cordova.exec(
	        	function(message){
	        		console.log("SUCESSO!");
	        		isPlaying = false;
	        		if (onSuccessCallback){
		        		onSuccessCallback(message);
	        		}
	        	}, 
	        	function(error){
	        			console.log(error);
	        		if (onErrorCallback){
	        			onErrorCallback(error);
	        		}
	        	}, 
	        	"MultiSongsPlugin", 
	        	"unload", 
	    		[]
	    	);

			isPlaying = false;

		},

		state : function(){
			return "";
		},

		playing : function(onSuccessCallback, onErrorCallback){

	        cordova.exec(
	        	function(message){
	        		isPlaying = true;
	        		if (onSuccessCallback){
		        		onSuccessCallback(message);
	        		}
	        	}, 
	        	function(error){
	        		if (onErrorCallback){
	        			onErrorCallback(error);
	        		}
	        	}, 
	        	"MultiSongsPlugin", 
	        	"status", 
	    		[]
	    	);

		},

		play : function(onSuccessCallback, onErrorCallback){

	        cordova.exec(
	        	function(message){
	        		isPlaying = true;
	        		if (onSuccessCallback){
		        		onSuccessCallback(message);
	        		}
	        	}, 
	        	function(error){
	        		if (onErrorCallback){
	        			onErrorCallback(error);
	        		}
	        	}, 
	        	"MultiSongsPlugin", 
	        	"play", 
	        	[]);

		},

		setStatusCallback : function(onSuccessCallback, onErrorCallback){

	        cordova.exec(
	        	function(message){
	        		if (onSuccessCallback){
		        		onSuccessCallback(message);
	        		}
	        	}, 
	        	function(error){
	        		if (onErrorCallback){
	        			onErrorCallback(error);
	        		}
	        	}, 
	        	"MultiSongsPlugin", 
	        	"statusCallback", 
	        	[]);

		},

		volume : function(level, filePath, onSuccessCallback, onErrorCallback){

	        cordova.exec(
	        	function(message){
	        		if (onSuccessCallback){
		        		onSuccessCallback(message);
	        		}
	        	}, 
	        	function(error){
	        		if (onErrorCallback){
	        			onErrorCallback(error);
	        		}
	        	}, 
	        	"MultiSongsPlugin", 
	        	"level", 
	        	[{filePath : filePath, level : parseInt(level * 127)}]);

		},

		masterLevel : function(level, onSuccessCallback, onErrorCallback){

	        cordova.exec(
	        	function(message){
	        		if (onSuccessCallback){
		        		onSuccessCallback(message);
	        		}
	        	}, 
	        	function(error){
	        		if (onErrorCallback){
	        			onErrorCallback(error);
	        		}
	        	}, 
	        	"MultiSongsPlugin", 
	        	"masterLevel", 
	        	[{level : parseInt(level * 127)}]);

		},

		masterPan : function(pan, onSuccessCallback, onErrorCallback){

	        cordova.exec(
	        	function(message){
	        		if (onSuccessCallback){
		        		onSuccessCallback(message);
	        		}
	        	}, 
	        	function(error){
	        		if (onErrorCallback){
	        			onErrorCallback(error);
	        		}
	        	}, 
	        	"MultiSongsPlugin", 
	        	"masterPan", 
	        	[{pan : parseInt(pan * 127)}]);

		},


		getDecibels : function(milliseconds, onSuccessCallback, onErrorCallback){

	        cordova.exec(
	        	function(message){
	        		if (onSuccessCallback){
		        		onSuccessCallback(message);
	        		}
	        	}, 
	        	function(error){
	        		if (onErrorCallback){
	        			onErrorCallback(error);
	        		}
	        	}, 
	        	"MultiSongsPlugin", 
	        	"decibels", 
	        	[{milliseconds : milliseconds}]);

		},

		setMark : function(seconds, phrase, onSuccessCallback, onErrorCallback){

			console.log("Esperando chegar " + seconds + " segundos...");

	        cordova.exec(
	        	function(message){
	        		if (onSuccessCallback){
		        		onSuccessCallback(message);
	        		}
	        	}, 
	        	function(error){
	        		if (onErrorCallback){
	        			onErrorCallback(error);
	        		}
	        	}, 
	        	"MultiSongsPlugin", 
	        	"mark", 
	        	[{seconds : seconds, phrase : phrase}]);

		},

		solo : function(filePath, onSuccessCallback, onErrorCallback){

	        cordova.exec(
	        	function(message){
	        		if (onSuccessCallback){
		        		onSuccessCallback(message);
	        		}
	        	}, 
	        	function(error){
	        		if (onErrorCallback){
	        			onErrorCallback(error);
	        		}
	        	}, 
	        	"MultiSongsPlugin", 
	        	"solo", 
	        	[{filePath : filePath}]);

		},

		unsolo : function(filePath, onSuccessCallback, onErrorCallback){

	        cordova.exec(
	        	function(message){
	        		if (onSuccessCallback){
		        		onSuccessCallback(message);
	        		}
	        	}, 
	        	function(error){
	        		if (onErrorCallback){
	        			onErrorCallback(error);
	        		}
	        	}, 
	        	"MultiSongsPlugin", 
	        	"unsolo", 
	        	[{filePath : filePath}]);

		},

		fade : function(initiaVol, finalVol, trackId, onSuccessCallback, onErrorCallback){

		},

		stereo : function(pan, filePath, onSuccessCallback, onErrorCallback){

	        cordova.exec(
	        	function(message){
	        		if (onSuccessCallback){
		        		onSuccessCallback(message);
	        		}
	        	}, 
	        	function(error){
	        		if (onErrorCallback){
	        			onErrorCallback(error);
	        		}
	        	}, 
	        	"MultiSongsPlugin", 
	        	"pan", 
	        	[{filePath : filePath, pan : parseInt(pan * 127)}]);

		},

		mute : function(isMute, filePath){

			var command;

			if (isMute){

				command = "mute";

			} else {

				command = "unmute";

			}

	        cordova.exec(
	        	function(message){
	        	}, 
	        	function(error){
	        	}, 
	        	"MultiSongsPlugin", 
	        	command, 
	        	[{filePath : filePath}]);

		},

		download : function(config, musicId, audioPath, artistName, musicName, isMultitrack, onSuccessCallback, onErrorCallback){

			var uri;

	        cordova.exec(
	        	function(message){
	        		if (onSuccessCallback){
		        		onSuccessCallback(message);
	        		}
	        	}, 
	        	function(error){
	        		if (onErrorCallback){
	        			onErrorCallback(error);
	        		}
	        	}, 
	        	"MultiSongsPlugin", 
	        	"download", 
	        	[{isMultitrack : isMultitrack, musicId : musicId, artistName : artistName, musicName : musicName, audioPath : audioPath, config : config}]);

		},

		checkDownloadPercentage : function(percentage, onSuccessCallback, onErrorCallback){

			var uri;

	        cordova.exec(
	        	function(message){
	        		if (onSuccessCallback){
		        		onSuccessCallback(message);
	        		}
	        	}, 
	        	function(error){
	        		if (onErrorCallback){
	        			onErrorCallback(error);
	        		}
	        	}, 
	        	"MultiSongsPlugin", 
	        	"percentage", 
	        	[{percentage : percentage}]);

		},

		seek : function(position, resultCallback){

			var newPosition;

	        cordova.exec(
	        	function(obj){


	        		if (resultCallback){
	        			resultCallback(obj);
	        		}


	        	}, 
	        	function(error){
	        		console.log(error);
	        	}, 
	        	"MultiSongsPlugin", 
	        	"seek", 
	        	[{position : position}]);

		},

		pause : function(onSuccessCallback){

	        cordova.exec(
	        	function(message){
	        		if (onSuccessCallback){
	        			onSuccessCallback();
	        		}
	        		isPlaying = false;
	        	}, 
	        	function(error){
	        	}, 
	        	"MultiSongsPlugin", 
	        	"pause", 
	        	[]);

		},

		createAnalyzer : function(trackId){ // trackId is optional. When omited, creates an Analyzer to the main channel
			return {
				connect : function(){

				},
				getByteTimeDomainData : function(dataArray){
					return dataArray;
				}
			};
		}

	};

});