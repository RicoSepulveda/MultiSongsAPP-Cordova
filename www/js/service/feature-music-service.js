module.factory('featuredMusicService', function($http, $interval, $q){
     
    return {
        
        getFeaturedMusicSets: function($rootScope, $scope, token) { 
              
            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");
            
            if ($rootScope.buffer.featuredMusicSets.valid){
                $interval(function(){deferred.resolve($rootScope.buffer.featuredMusicSets.data);}, 50, 1);
            }else{

                var request = $http({
                    method: "post",
                    url: ms_hostname + "/MultiSongs/api/featured/list",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                    },
                    dataType:"json",
                    data: {token : token}
                });


                request.success(
                    function( response ) {

                        $rootScope.buffer.featuredMusicSets.data = response;
                        $rootScope.buffer.featuredMusicSets.valid = true;

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

        getFeaturedMusicSet: function($rootScope, $scope, $rootScope, token, id) { 
              
            var deferred = $q.defer();

            if ($rootScope.buffer.featuredMusicSet && $rootScope.buffer.featuredMusicSet[id] && $rootScope.buffer.featuredMusicSet[id].valid){
                $interval(function(){deferred.resolve($rootScope.buffer.featuredMusicSet[id].data);}, 50, 1);
            } else {

                var ms_hostname = window.localStorage.getItem("environment");

                var request = $http({
                    method: "post",
                    url: ms_hostname + "/MultiSongs/api/featured/get",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                    },
                    dataType:"json",
                    data: {token : token, id : id}
                });


                request.success(
                    function( response ) {

                        $rootScope.buffer.featuredMusicSet[id].data = response;
                        $rootScope.buffer.featuredMusicSet[id].valid = true;

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
            
        } 

    }
      
     
 });