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
			        	function(erro){
			        		onErrorCallback(erro);
			        	}, 
			        	"MultiSongsPlugin", 
			        	"load", 
			        	uriObjects);

	        	}, 
	        	function(erro){
	        		onErrorCallback(erro);
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
	        	function(erro){
	        		if (onErrorCallback){
	        			onErrorCallback(erro);
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
			        	function(erro){
			        		if (onErrorCallback){
			        			onErrorCallback(erro);
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
	        	function(erro){
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
	        	function(erro){
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
	        	function(erro){
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
	        	function(erro){
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
	        	function(erro){
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
	        	function(erro){
	        	}, 
	        	"MultiSongsPlugin", 
	        	command, 
	        	[{id : trackId}]);

		},

		seek : function(position, resultCallback){

			var newPosition;

	        cordova.exec(
	        	function(obj){


	        		if (resultCallback){
	        			resultCallback(obj);
	        		}


	        	}, 
	        	function(erro){
	        		console.log(erro);
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
	        	function(erro){
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