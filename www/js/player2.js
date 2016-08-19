module.factory('msPlayer', function($http, $q){

	var _promisses = [];
	var _tracks = [];

	function getMp3(){

		$scope.debugTxt2 = "Chegou no getMP3...";

		var deferred = $q.defer();

		var request = $http({
			method: "get",
			url: "http://app.multisongs.audio/MultiSongs/api/download/music/" + token + "/" + this.getDetails().id,
			responseType :"arraybuffer"
		});


	    request.success(

	        function( response ) {

	        	$scope.debugTxt2 = "requisicao ok: " + _this.getPlayer();

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

	}
     
    return {
        
	    loadTracks: function ($scope, callback, token) {
	      
	      $scope.debugTxt2 = "Chegou no loadFiles...";

		    musicDetails.tracks.forEach(function (entry){

		    	var track = {_bufferSource: null, _trackDetails: entry};

		        _promisses.push(getMP3());
/*
		    	_tracks.push(track);
*/

		    });

		    $scope.debugTxt2 = "Terminou de criar todas as trilhas...";
/*
		    $q.all(this.getPromisses()).then(

		        function(response) {

		        	$scope.debugTxt2 = $scope.debugTxt2 + "Todos os promisses terminaram...";
		        	callback();

		        },
		        function(response) { 
		        	$scope.debugTxt2 = "Failed"; 
		        }
		    ).finally(function() {

		    });
*/
		    $scope.debugTxt2 = $scope.debugTxt2 + "Saindo do loadFiles...";

	    },
	    play: function ($scope){
			$scope.debugTxt2 = $scope.debugTxt2 + "; Chegou no play...";
	    }

    }
      
     
 });

/*
MSPlayer.prototype.loadFiles = function($scope, $q, $http, callback, musicDetails, token){

	$scope.debugTxt2 = $scope.debugTxt2 + "Chegou no loadFiles...";

    musicDetails.tracks.forEach(function (entry){

    	$scope.debugTxt2 = "entry: " + entry;

    	var track;

    	track = new MSTrack($scope, entry);

    	$scope.debugTxt2 = "this.getPromisses(): " + this.getPromisses();

        this.getPromisses().push(track.getMP3($scope, $q, $http, token));

    	this.getTracks().push(track);


    });

    $scope.debugTxt2 = "Terminou de criar todas as trilhas...";

    $q.all(this.getPromisses()).then(

        function(response) {

        	$scope.debugTxt2 = $scope.debugTxt2 + "Todos os promisses terminaram...";
        	callback();

        },
        function(response) { 
        	$scope.debugTxt2 = "Failed"; 
        }
    ).finally(function() {

    });

    $scope.debugTxt2 = $scope.debugTxt2 + "Saindo do loadFiles...";

};

MSPlayer.prototype.play = function($scope){

	$scope.debugTxt2 = "Chamou o play...";

	_msPlayer.getTracks().forEach(function (entry){

		$scope.debugTxt2 = "entry.getBufferSource(): " + entry.getBufferSource();

		entry.getBufferSource().start(0);

	});

	$scope.debugTxt2 = "Saiu do play...";

};

var MSTrack = function($scope, trackDetails){

	$scope.debugTxt2 = "Chegou no construtor do MSTrack...";

	var _bufferSource = "";

	var _details = trackDetails;

	this.getBufferSource = function(){
		return _bufferSource;
	};

	this.setBufferSource = function(newBufferSource){
		_bufferSource = newBufferSource;
	}

	this.getDetails = function(){
		return _details;
	};

};

MSTrack.prototype.getMP3 = function($scope, $q, $http, token){

	$scope.debugTxt2 = "Chegou no getMP3...";

	var deferred = $q.defer();
	var _this = this;

	$scope.debugTxt2 = "vai criar request...";

	var request = $http({
		method: "get",
		url: "http://app.multisongs.audio/MultiSongs/api/download/music/" + token + "/" + this.getDetails().id,
		responseType :"arraybuffer"
	});


    request.success(

        function( response ) {

        	$scope.debugTxt2 = "requisicao ok: " + _this.getPlayer();

        	var d = false;

            _msPlayer.getContext().decodeAudioData(response, function(buffer){

                d = true;

				$scope.debugTxt2 = "tentando converter...";

                var playSound = _msPlayer.getContext().createBufferSource();

                playSound.buffer = buffer;
                playSound.connect(_msPlayer.getContext().destination);

                _this.setBufferSource(playSound);

            });

			if (d){
	            $scope.debugTxt2 = "Decodificou ok...";
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

*/