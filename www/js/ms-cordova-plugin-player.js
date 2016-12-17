module.factory('msCordovaPluginPlayer', function(){

	var isPlaying = false;

	return {

		createPlugin : function(isDemo, khz, encode, channels, uriObjects, fileDirectory, onSuccessCallback, onErrorCallback){

			var configuration = [];

			configuration[0] = {demoMode : isDemo, khz : khz, encode : encode, channels : channels, fileDirectory : fileDirectory};

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
		
		},

		unload : function(){
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

		volume : function(level, trackId, onSuccessCallback, onErrorCallback){

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
	        	[{id : trackId, value : level}]);

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

		solo : function(trackId, onSuccessCallback, onErrorCallback){

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
	        	[{id : trackId}]);

		},

		unsolo : function(trackId, onSuccessCallback, onErrorCallback){

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
	        	[{id : trackId}]);

		},

		fade : function(initiaVol, finalVol, trackId, onSuccessCallback, onErrorCallback){

		},

		stereo : function(pan, trackId, onSuccessCallback, onErrorCallback){

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
	        	[{id : trackId, value : pan}]);

		},

		mute : function(isMute, trackId){

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
	        	[{id : trackId}]);

		},

		download : function(songId, uri, onSuccessCallback, onErrorCallback){

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
	        	[{id : songId, uri : uri}]);

		},

		checkDownloadPercentage : function(onSuccessCallback, onErrorCallback){

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
	        	[]);

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

		pause : function(){

	        cordova.exec(
	        	function(message){
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