module.factory('html5Player', function($interval, $q, $cordovaFileTransfer, musicService, setlistService, auth){

	var _sounds = [];
	var _fileFormat = '';
	var _audioCtx;
	var _gainNode;
	var _state;

	var STATE_UNLOADED = "unloaded";
	var STATE_LOADED = "loaded";
	var STATE_LOADING = "loading";

	var _sound = function(){

		return {
			id : null,
			audio : null, 
			url : null,
			source : null
		}

	}

	var _getSound = function(id) {

		var result;

		result = null;

		_sounds.forEach(function(entry){
			if (entry.id == id){
				result = entry;
			}
		});

		return result;

	}

	return {

		create : function(fileFormat){

			_audioCtx = new AudioContext();

			_fileFormat = fileFormat;
			_gainNode = _audioCtx.createGain();

			_gainNode.connect(_audioCtx.destination);

			_sounds = [];

			_state = STATE_UNLOADED;

		},

		addNode : function(url){

			var audio;
			var sound;
			var source;

			audio = new Audio(url);
			sound = new _sound();

			source = _audioCtx.createMediaElementSource(audio);

			source.connect(_gainNode);

			sound.audio = audio;

			sound.audio.type = _fileFormat;
			sound.audio.mediagroup = "uniqueMediaGroup";
			sound.audio.controls = false;
			sound.audio.crossOrigin = "anonymous";

			sound.id = _sounds.length + 1;
			sound.url = url;
			sound.source = source;

			_state = STATE_LOADED;

			_sounds.push(sound);

			return _sounds.length;

		},

		state : function(){
			return _state;
		},

		play : function(){

			$interval(function(){

				var canStart = true;

				_sounds.forEach(function(entry){
					canStart = canStart & (entry.audio.buffered.length > 0);
				});

				if (canStart){
					_sounds.forEach(function(entry){
						entry.audio.play();
					});
				}

			}, 1000, 10);



		},

		volume : function(newVolume, soundId){

			if (!soundId){

				_sounds.forEach(function(entry){
					entry.audio.volume = entry.audio.volume * newVolume;
				});

			} else {

				if(_getSound(soundId) != null){
					_getSound(soundId).audio.volume = _getSound(soundId).audio.volume * newVolume;
				}

			}

		},

		fade : function(init, end, time, soundId){

		},

		stereo : function(pan, soundId){

		},

		mute : function(state, soundId){

		},

		unload : function(){

		},

		pause : function(){

		},

		seek : function(seconds, soundId){

		},

		getNode : function(soundId){

		},

		getSound : function(soundId){

		}

	}


});