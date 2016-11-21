module.factory('searchService', function($http, $q){
     
    return {
        
        searchByKeyword: function($scope, token, limit, keyword) { 
            
            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");
            
            var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/music/search/keyword",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",

                data: {token : token, limit : limit, keyword: keyword}
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
        
        searchByType: function($scope, token, limit, keyword, type) { 
            
            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");
            
            var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/music/search/by",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",

                data: {token : token, limit : limit, keyword: keyword, searchType: type}
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
