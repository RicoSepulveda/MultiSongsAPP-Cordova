module.factory('wishlistService', function($http, $q){
     
    return {
        getWishlists: function(token) { 

            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");
            
            var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/music/wish",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                   },
                   dataType:"json",

                data: {token : token}
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
            
        } 
    }
      
     
 });
