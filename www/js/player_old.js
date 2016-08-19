
var MSPlayer = function(musicDetails, $q, $http, $scope, token) {

    $scope.debugTxt2 = "Chegou no construtor do MSPlayer...";

	var _tracks = [];
	var _promisses = [];

	var _context = new AudioContext();

	var _q = $q;
	var _http = $http;
	var _token = token;

	this.getTracks = function(){
		return _tracks;
	};

	this.getPromisses = function(){
		return _promisses;
	};

	this.getContext = function(){
		return _context;
	};

	this.getQ = function(){
		return _q;
	};

	this.getToken = function(){
		return _token;
	};



    $scope.debugTxt2 = "musicDetails: " + musicDetails;
    $scope.debugTxt2 = "musicDetails.tracks: " + musicDetails.tracks;

    musicDetails.tracks.forEach(function (entry){

    	$scope.debugTxt2 = "entry: " + entry;

    	var track;

    	track = new MSTrack($scope, entry, token, this);

    	$scope.debugTxt2 = "track: " + track;
    	$scope.debugTxt2 = "_promisses: " + _promisses;
    	$scope.debugTxt2 = "_q: " + _q;
    	$scope.debugTxt2 = "_http: " + _http;
    	$scope.debugTxt2 = "_tracks: " + _tracks;

        _promisses.push(track.getMP3($scope, _q, _http));

    	_tracks.push(track);


    });

    $scope.debugTxt2 = "Terminou de criar todas as trilhas...";

};

MSPlayer.prototype.loadFiles = function($scope, callback){

	$scope.debugTxt2 = $scope.debugTxt2 + "Chegou no loadFiles...";

	var _this = this;

    this.getQ().all(this.getPromisses()).then(

        function(response) {

        	$scope.debugTxt2 = $scope.debugTxt2 + "Todos os promisses terminaram...";
        	callback();
/*
        	$scope.debugTxt2 = "Todos os promisses terminaram...";

        	var d = false;

            // Creates buffers
            _this.getTracks().forEach(function (entry){

	            _this.getContext().decodeAudioData(entry.getMP3Data(), function(buffer){
	                d = true;
	                var playSound = _this.getContext().createBufferSource();

	                playSound.buffer = buffer;
	                playSound.connect(_this.getContext().destination);

	                entry.setBufferSource(playSound);

	            });

            });
			if (d){
	            $scope.debugTxt2 = "Decodificou todos os conteudos das tracks...";

	            callback();

	        }else{
	            $scope.debugTxt2 = "Nao codificou...";
	        }
*/
        },
        function(response) { 
        	$scope.debugTxt2 = 'Failed'; 
        }
    ).finally(function() {

    });

    $scope.debugTxt2 = $scope.debugTxt2 + "Saindo do loadFiles...";

};

MSPlayer.prototype.play = function($scope){

	$scope.debugTxt2 = "Chamou o play...";

	this.getTracks().forEach(function (entry){

		$scope.debugTxt2 = "entry.getBufferSource(): " + entry.getBufferSource();

		entry.getBufferSource().start(0);

	});

	$scope.debugTxt2 = "Saiu o play...";

};

var MSTrack = function($scope, trackDetails, token, player){

	$scope.debugTxt2 = "Chegou no construtor do MSTrack...";

	var _mp3Data = "";
	var _bufferSource = "";

	var _token = token;
	var _details = trackDetails;
	var _player = player;

	this.getMP3Data = function(){
		return _mp3Data;
	};

	this.setMP3Data = function(newMP3){
		_mp3Data = newMP3;
	}

	this.getBufferSource = function(){
		return _bufferSource;
	};

	this.setBufferSource = function(newBufferSource){
		_bufferSource = newBufferSource;
	}

	this.getToken = function(){
		return _token;
	};

	this.getDetails = function(){
		return _details;
	};

	this.getPlayer = function(){
		return _player;
	};



};

/*Get the MP3 file from server*/
MSTrack.prototype.getMP3 = function($scope, _q, _http){

	$scope.debugTxt2 = "Chegou no getMP3...";

	var deferred = _q.defer();
	var _this = this;

	$scope.debugTxt2 = "vai criar request...";

	var request = _http({
		method: "get",
		url: "http://app.multisongs.audio/MultiSongs/api/download/music/" + this.getToken() + "/" + this.getDetails().id,
		responseType :"arraybuffer"
	});


    request.success(

        function( response ) {

        	$scope.debugTxt2 = "requisicao ok: " + _this.getPlayer();

        	var d = false;

            _this.getPlayer().getContext().decodeAudioData(response, function(buffer){

                d = true;
$scope.debugTxt2 = "tentando converter...";
                var playSound = _this.getPlayer().getContext().createBufferSource();

                playSound.buffer = buffer;
                playSound.connect(_this.getPlayer().getContext().destination);

                _this.setBufferSource(playSound);

            });
/*
        	_this.setMP3Data(response);

        	$scope.debugTxt2 = "requisicao com sucesso. vai chamar deferred: " + deferred;

            deferred.resolve(response);

        	$scope.debugTxt2 = "passou pelo deferred.resolve(response)...";
*/

			if (d){
	            $scope.debugTxt2 = "Decodificou ok...";

	            callback();

	        }else{
	            $scope.debugTxt2 = "Nao decodificou...";
	        }

			deferred.resolve(response);

        }

    );


    request.error(

        function( response ) { 

        	$scope.debugTxt2 = "deu problema na requisicao...";

            deferred.reject(response);

        }

    );

    $scope.debugTxt2 = "vai retornar o promisse...";

    return deferred.promise;

};