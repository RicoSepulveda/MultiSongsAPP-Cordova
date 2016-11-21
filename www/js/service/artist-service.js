module.factory('artistService', function($http, $interval, $q){
     
    return {
        
        getTopArtists: function($rootScope, $scope, token, limit) { 
            
            var deferred = $q.defer();

            if ($rootScope.buffer.topArtists.valid){
                $interval(function(){deferred.resolve($rootScope.buffer.topArtists.data);}, 50, 1);
            }else{

                var ms_hostname = window.localStorage.getItem("environment");

                var request = $http({
                    method: "post",
                    url: ms_hostname + "/MultiSongs/api/artist/top",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                   },
                   dataType:"json",

                    data: {token : token, limit : limit}
                });


                request.success(

                    function( response ) {

                        $rootScope.buffer.topArtists.data = response;
                        $rootScope.buffer.topArtists.valid = true;
                        
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
            
        } 
    }
      
     
});
