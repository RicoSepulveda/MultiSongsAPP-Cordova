module.factory('musicService', function($http, $interval, $q, $rootScope){
    
    return {
        
        getNewSongs : function(token, limit) { 
            
            var deferred = $q.defer();


            if ($rootScope.buffer.newSongs.valid){
                 $interval(function(){deferred.resolve($rootScope.buffer.newSongs.data);}, 50, 1);
            } else {

                var ms_hostname = window.localStorage.getItem("environment");

                 var request = $http({
                    method: "post",
                    url: ms_hostname + "/MultiSongs/api/music/news",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                   },
                   dataType:"json",
                    data: {token: token, limit: limit}
                });


                request.success(

                    function( response ) {

                        deferred.resolve(response);

                        $rootScope.buffer.newSongs.data = response;
                        $rootScope.buffer.newSongs.valid = true;

                    }

                );

                request.error(

                        function( response ) { 

                            deferred.reject(response);

                        }

                );
     
             }
           
            return deferred.promise;
            
        },
        getTopMusics : function(token, limit) { 
            
            var deferred = $q.defer();

            if ($rootScope.buffer.topMusics.valid){
                $interval(function(){deferred.resolve($rootScope.buffer.topMusics.data);}, 50, 1);
            } else {

                var ms_hostname = window.localStorage.getItem("environment");

                 var request = $http({
                    method: "post",
                    url: ms_hostname + "/MultiSongs/api/music/top",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                    },
                    dataType:"json",
                    data: {token: token, limit: limit}
                });


                request.success(

                    function( response ) {
                        //$scope.destaqueStr = response;

                        $rootScope.buffer.topMusics.valid = true;
                        $rootScope.buffer.topMusics.data = response;

                        deferred.resolve(response);

                    }

                );

                request.error(

                        function( response ) { 

                            deferred.reject(response);

                        }
                );

            }
            
            return deferred.promise;
                
        },
        getMyRemovedSongs : function(token) { 
            
            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");

             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/music/removed",
                headers: {
                   "Accept": "application/json;charset=utf-8"
                },
                dataType:"json",
                data: {token: token}
            });


            request.success(

                function( response ) {
                    //$scope.destaqueStr = response;

                    deferred.resolve(response);

                }

            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);

                    }
            );

            return deferred.promise;
            
        },
        changeFavorite : function(token, musicId) { 
            
            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");
            
             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/music/favorite/change",
                headers: {
                   "Accept": "application/json;charset=utf-8"
                },
                dataType:"json",
                data: {token: token, id: musicId}
            });


            request.success(

                function( response ) {
                    //$scope.destaqueStr = response;

                    deferred.resolve(response);

                }

            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);

                    }
            );
            
            return deferred.promise;
                
        },
        vote : function(token, pedidoId) {  // Vota em um pedido de playback feito por um usuario
            
            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");
            
             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/music/vote",
                headers: {
                   "Accept": "application/json;charset=utf-8"
                },
                dataType:"json",
                data: {token: token, id: pedidoId}
            });


            request.success(

                function( response ) {
                    //$scope.destaqueStr = response;

                    deferred.resolve(response);

                }

            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);

                    }
            );
            
            return deferred.promise;
                
        },
        removeSongFromUser : function(token, musicId) { 
            
            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");
            
             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/music/remove",
                headers: {
                   "Accept": "application/json;charset=utf-8"
                },
                dataType:"json",
                data: {token: token, id: musicId}
            });


            request.success(

                function( response ) {
                    //$scope.destaqueStr = response;

                    deferred.resolve(response);

                }

            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);

                    }
            );
            
            return deferred.promise;
                
        },
        getRecentlyAdded : function(token) { 
            
            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");
            
             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/music/recent",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
                data: {token: token}
            });

            request.success(

                function( response ) {

                    deferred.resolve(response);

                }

            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);

                    }
            );
            
            return deferred.promise;
              
        },
        getMyMusics : function(token) {
            
            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");

            var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/music/mine",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
                data: {token: token}
            });


            request.success(

                function( response ) {

                    deferred.resolve(response);

                }

            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);

                    }
            );
            
            return deferred.promise;
            
        },
        getSugestions : function(token) {
            
            var deferred = $q.defer();

            if ($rootScope.buffer.sugestions.valid){
                $interval(function(){deferred.resolve($rootScope.buffer.sugestions.data);}, 50, 1);
            } else {

                var ms_hostname = window.localStorage.getItem("environment");

                 var request = $http({
                    method: "post",
                    url: ms_hostname + "/MultiSongs/api/music/suggestions",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                   },
                   dataType:"json",
                    data: {token: token}
                });


                request.success(

                    function( response ) {

                        $rootScope.buffer.sugestions.valid = true;
                        $rootScope.buffer.sugestions.data = response;

                        deferred.resolve(response);

                    }

                );

                request.error(

                        function( response ) { 

                            deferred.reject(response);

                        }
                );

            }
            
            return deferred.promise;
            
        },
        buy : function(id, token) {
            
            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");
            
             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/music/buy",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
               data: {token: token, id: id}
            });

            request.success(

                function( response ) {

                    deferred.resolve(response);
                    //$scope.musics = response.musicas;

                }

            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);

                    }
            );
            
            return deferred.promise;
            
        },
        getMusicDetails : function(token, musicId, trackType) {
            
            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");

             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/music/details",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
                data: {token: token, id : musicId, trackType : trackType}
            });


            request.success(

                function( response ) {

                    deferred.resolve(response);

                }
 
            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);

                    }
            );
            
            return deferred.promise;
            
        },
        newPlayback : function(token, nomeMusica, nomeArtista) {
            
            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");

             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/music/requisition",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
                data: {token: token, nomeMusica : nomeMusica, nomeArtista : nomeArtista}
            });


            request.success(

                function( response ) {

                    deferred.resolve(response);

                }
 
            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);

                    }
            );
            
            return deferred.promise;
            
        }

        
    }
      
     
 });
