module.factory('styleService', function($http, $q, $interval, $rootScope){
    
    return {
        
        getStyles : function(token) { 

            var deferred = $q.defer();

            if ($rootScope.buffer.styles.valid){
                $interval(function(){deferred.resolve($rootScope.buffer.styles.data);}, 50, 1);

            }else{

                var ms_hostname = window.localStorage.getItem("environment");

                var request = $http({
                    method: "post",
                    url: ms_hostname + "/MultiSongs/api/style/list",
                headers: {
                    "Accept": "application/json;charset=utf-8"
                },
                    dataType:"json",
                    data: {token: token}
                });

                request.success(

                    function( response ) {

                        $rootScope.buffer.styles.data = response;
                        $rootScope.buffer.styles.valid = true;

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
