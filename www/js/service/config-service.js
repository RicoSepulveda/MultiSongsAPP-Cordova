module.factory('configService', function($http, $interval, $q){
     
    return {
        
        getConfig: function($rootScope, $scope, token, sessionConfig) { 
              
            var deferred = $q.defer();

            if ($rootScope.buffer.config.valid){

                $interval(function(){deferred.resolve($rootScope.buffer.config.data);}, 50, 1);

            } else {

                var ms_hostname = window.localStorage.getItem("environment");
                
                var request = $http({
                    method: "post",
                    url: ms_hostname + "/MultiSongs/api/general/config",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                    },
                    dataType:"json",
                    data: {token : token}
                });

                request.success(
                    
                    function( response ) {

                        $rootScope.buffer.config.data = response;
                        $rootScope.buffer.config.valid = true;

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
