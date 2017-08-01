module.factory('promotionService', function($http, $q){
    
    return {
        
        getPromotion : function(token) { 

            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");

             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/promotion/get",
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

        setAnswer : function(promotionId, questionId, token, answer) { 

            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");

             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/promotion/answer/set",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
                data: {promotionId : promotionId, questionId : questionId, token : token, answer : answer}
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
