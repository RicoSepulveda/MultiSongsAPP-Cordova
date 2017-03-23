module.factory('loginService', function($http, $rootScope, $ionicModal, auth){
    
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
                        auth.userType = response.userType;
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
        
        login: function($scope, key, password, callbackFunction) { 

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

                    this.token = response.token;

                    callbackFunction(response);
                }
            );

            request.error(
                function( response , textStatus, errorThrown) { 
                    $scope.debugTxt = response + " - " + errorThrown + " - " + textStatus; 
                }
            );

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
