module.factory('styleService', function($http, $q, $interval){
    
    return {
        
        getStyles : function($rootScope, $scope, token) { 

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

                        var remainder;
                        var counter;
                        var cardIndex;
                        var styleIndex;

                        $rootScope.buffer.styles.data = response;
                        $rootScope.buffer.styles.valid = true;

                        counter = 0;
                        cardIndex = -1;
                        styleIndex = -1;

                        $scope.styleCards = [];

                        $scope.styleCards[0] = [];                        

                        response.estilos.forEach(function (entry){

                            remainder = counter % 4;

                            if (remainder == 0) {

                                cardIndex++;
                                styleIndex = 0;

                                $scope.styleCards[cardIndex] = [];                        

                            } else {
                                styleIndex++;
                            }

                            $scope.styleCards[cardIndex][styleIndex] = entry;

                            entry.margin = (styleIndex==0)?"padding-right:2px;":
                                           (styleIndex==1 || styleIndex==2)?"padding-right:1px;padding-left:1px;":"padding-left:2px;";

                            counter++;

                        });

                        //$scope.musicStyles = response.estilos;
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
