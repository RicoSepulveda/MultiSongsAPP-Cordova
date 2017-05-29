module.factory('musicService', function($http, $interval, $q){
    
    return {
        
        getNewSongs : function($rootScope, $scope, token) { 
            
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
                    data: {token: token, limit: 6}
                });


                request.success(

                    function( response ) {

                        deferred.resolve(response);

                        $rootScope.buffer.newSongs.data = response;
                        $rootScope.buffer.newSongs.valid = true;

                        $scope.newSongsRow1 = response.musicas.slice(0,3);
                        $scope.newSongsRow2 = response.musicas.slice(3,6);

                        $scope.newSongsRow1[0].margin="margin-right:6px";
                        $scope.newSongsRow1[1].margin="margin-right:3px;margin-left:3px";
                        $scope.newSongsRow1[2].margin="margin-left:6px";

                        $scope.newSongsRow2[0].margin="margin-right:6px";
                        $scope.newSongsRow2[1].margin="margin-right:3px;margin-left:3px";
                        $scope.newSongsRow2[2].margin="margin-left:6px";

                    }

                );

                request.error(

                        function( response ) { 

                            deferred.reject(response);
                            $scope.destaqueStr = response; 

                        }

                );
     
             }
           
            return deferred.promise;
            
        },
        getTopMusics : function($rootScope, $scope, token, limit) { 
            
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
                            $scope.destaqueStr = response; 

                        }
                );

            }
            
            return deferred.promise;
                
        },
        getMyRemovedSongs : function($scope, token) { 
            
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
        changeFavorite : function($scope, token, musicId) { 
            
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
                        $scope.destaqueStr = response; 

                    }
            );
            
            return deferred.promise;
                
        },
        removeSongFromUser : function($scope, token, musicId) { 
            
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
        getRecentlyAdded : function($scope, token) { 
            
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
                        $scope.destaqueStr = response; 

                    }
            );
            
            return deferred.promise;
              
        },
        getMyMusics : function($scope, token) {
            
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
                    $scope.musics = response.musicas;

                }

            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);
                        $scope.destaqueStr = response; 

                    }
            );
            
            return deferred.promise;
            
        },
        getSugestions : function($rootScope, $scope, token) {
            
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
                            $scope.destaqueStr = response; 

                        }
                );

            }
            
            return deferred.promise;
            
        },
        buy : function($scope, id, token) {
            
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
                    $scope.musics = response.musicas;

                }

            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);

                    }
            );
            
            return deferred.promise;
            
        },
        getMusicDetails : function(token, musicId) {
            
            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");

             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/music/details",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
                data: {token: token, id : musicId}
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
