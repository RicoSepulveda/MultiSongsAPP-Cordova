module.factory('loginService', function($http, $rootScope, $ionicModal, $q, auth){
    
    return {

        createAccount: function(token, key, password, name, idiom, country, age, instruments, generes, objectives, callbackFunction) { 

            var ms_hostname = window.localStorage.getItem("environment");
            
             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/auth/create/v2",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
               data: {token : token, key : key, password: password, name : name, idiom : idiom, country : country, type : 2, age : age, instruments : instruments, generes : generes, objectives : objectives, locale : $rootScope.locale}
            });


            request.success(
                function( response ) {

                    if (response.success == true){
                        auth.token = response.token;
                        auth.type = response.userType;
                        auth.subscriptionCode = '';
                    }

                    callbackFunction(response);

                }
            );

            request.error(
                function( response , textStatus, errorThrown) { 
                    //$scope.debugTxt = response + " - " + errorThrown + " - " + textStatus; 
                    callbackFunction(response);
                }
            );

        },
        
        registerSubscriptionAttempt: function(token, codeOnStore, developerPayload, callback) { 

            var ms_hostname = window.localStorage.getItem("environment");
            
             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/auth/subscription/attempt",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
               data: {token : token, 
                      code: codeOnStore, 
                      developerPayload : developerPayload
                  }
            });


            request.success(
                function( response ) {
                    callback(response);
                }
            );

            request.error(
                function( response , textStatus, errorThrown) { 
                    response.success = false;
                    callback(response);
                }
            );

        },
        
        unsubscribe: function(token, callback) { 

            var ms_hostname = window.localStorage.getItem("environment");
            
             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/auth/unsubscribe",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
               data: {token : token}
            });


            request.success(
                function( response ) {
                    callback(response);
                }
            );

            request.error(
                function( response , textStatus, errorThrown) { 
                    callback(response);
                }
            );

        },
        
        validateSubscription: function(token, product, callback) { 

            var ms_hostname = window.localStorage.getItem("environment");

             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/auth//subscription/validate",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
               data: {token : token, 
                      orderId: product.transaction.id, 
                      developerPayload : product.transaction.developerPayload,
                      purchaseToken : product.transaction.purchaseToken,
                      signature : product.transaction.signature,
                      receipt : product.transaction.receipt}
            });

            request.success(

                function( response ) {

                    console.log("validateSubscription.response... -> " + response);

                    callback(response);

                }

            );

            request.error(
                function( response , textStatus, errorThrown) { 

                    response.success = false;

                    callback(response);
            });

        },



        login: function(key, password, callbackFunction) { 

            var ms_hostname = window.localStorage.getItem("environment");
            
             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/auth/login/v2",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
               data: {key : key, password: password, locale : $rootScope.locale}
            });


            request.success(
                function( response ) {

                    auth.token = response.token;
                    auth.type = response.userType;
                    auth.subscriptionCode = response.subscriptionCode;

                    this.token = response.token;

                    callbackFunction(response);

                }
            );

            request.error(
                function( response , textStatus, errorThrown) { 
                    callbackFunction(response);
                }
            );

        },

        validateDiscountCode: function(code, token, callbackFunction) { 

            var ms_hostname = window.localStorage.getItem("environment");
            
             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/auth/discount/validate",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
               data: {code : code, token: token}
            });


            request.success(
                function( response ) {
                    callbackFunction(response);
                }
            );

            request.error(
                function( response , textStatus, errorThrown) { 
                    callbackFunction(response);
                }
            );

        },

        getDiscountCodes: function(token, callbackFunction) { 

            var ms_hostname = window.localStorage.getItem("environment");

            var deferred = $q.defer();
            
             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/auth/discount/list",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
               data: {token: token, locale : $rootScope.locale}
            });


            request.success(

                function( response ) {

                    if (callbackFunction){
                        callbackFunction(response);
                    }

                    deferred.resolve(response);

                }

            );

            request.error(

                function( response , textStatus, errorThrown) { 
                    
                    if (callbackFunction){
                        callbackFunction(response);
                    }

                    deferred.reject(response);

                }

            );

            return deferred.promise;

        },

        createPrivateDiscountCodes: function(token, promotionId, callbackFunction) { 

            var ms_hostname = window.localStorage.getItem("environment");

            var deferred = $q.defer();
            
             var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/auth/discount/private/create",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
               data: {token: token, id : promotionId}
            });


            request.success(

                function( response ) {

                    if (callbackFunction){
                        callbackFunction(response);
                    }

                    deferred.resolve(response);

                }

            );

            request.error(

                function( response , textStatus, errorThrown) { 
                    
                    if (callbackFunction){
                        callbackFunction(response);
                    }

                    deferred.reject(response);

                }

            );

            return deferred.promise;

        },

        validateAuthorization: function(description, callback, args){

            if (auth.type && auth.type != 1){

                callback(args);

            } else {

                $rootScope.description = description;

                $rootScope.originalDescription = $rootScope.description;
                $rootScope.descriptionClass = "ms-font-light-gray";

                $rootScope.callback = {func : callback, args : args};

                $ionicModal.fromTemplateUrl('templates/login.html', {
                    scope: $rootScope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    $rootScope.loginModal = modal;
                    $rootScope.loginModal.show();
                });

            }

        }

    }
     
});
