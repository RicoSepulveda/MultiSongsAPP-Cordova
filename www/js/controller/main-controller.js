module.controller('MainController', function($scope,
                                             $rootScope,
                                             $ionicModal,
                                             $ionicPopup,
                                             $ionicNavBarDelegate,
                                             $location,
                                             auth,
                                             loginService,
                                             countryService,
                                             msSessionConfig) {
    
    $scope.openSearch = function ( path ) {
      $location.path('/search/');
    };

    $scope.cleanErrorMessage = function(){
        $rootScope.description = $rootScope.originalDescription;
        $rootScope.descriptionClass = "ms-font-light-gray";
    }

    $scope.go = function ( path ) {

        var description;

        description = $rootScope.i18.general.bloquedResourceMessage; 

        if (path != '/wishlist' && path != '/setlist' && path != '/musics'){
            $location.path(path);
        } else {
            loginService.validateAuthorization(description, function(path){$location.path(path)}, path);
        }

    }


    $scope.openCreateAccountModal = function(){

        $rootScope.loginModal.hide();

        $location.path("/createAccount"); 

/*
        $rootScope.description = $rootScope.i18.general.createAccountDescriptionMessage;
        $rootScope.originalDescription = $rootScope.description;

        $rootScope.createAccountData = {key : "", password : "", name : "", idiom : "", country : ""};

        countryService.getCountries($rootScope);


        $ionicModal.fromTemplateUrl('templates/createAccount.html', {
            scope: $rootScope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $rootScope.createAccountModal = modal;
            $rootScope.createAccountModal.show();
        });
*/
    }

    $scope.changeUser = function(){

        // Fica indefinido quando usuario nao preenche os dados no form...
        if (!$scope.loginData){
            $scope.loginData = {key : "", password : ""};
        }

        loginService.login($scope.loginData.key, 
                           $scope.loginData.password, 
                           function(response){

            if (response.success == true){

                $rootScope.buffer.config.valid = false; // Faz com que o config seja recarregado com o idioma do usuario logado.
                $rootScope.buffer.sugestions.valid = false; // Faz com que o sugestions seja recarregado com o sugestoes do usuario logado.
                $location.path("/");
                
                window.localStorage.setItem("key", $scope.loginData.key);
                window.localStorage.setItem("password", $scope.loginData.password);
                
                if (auth.type == 1){
                    $rootScope.originalDescription = $rootScope.description;
                    $rootScope.description = $rootScope.i18.general.loginErrorDescriptionMessage;
                    $rootScope.descriptionClass = "ms-font-multisongs";
                } else {

                    var alertPopup = $ionicPopup.alert({
                        title: $rootScope.i18.general.loggedInMessage,
                        template: $rootScope.i18.general.loggedInDescriptionMessage
                    });

                    alertPopup.then(function(res) {
                        $rootScope.loginModal.hide();
                        $rootScope.callback.func($rootScope.callback.args);
                    });
                    
                }

            } else {
                $rootScope.originalDescription = $rootScope.description;
                $rootScope.description = $rootScope.i18.general.loginErrorDescriptionMessage;
                $rootScope.descriptionClass = "ms-font-multisongs";

            }

        });

    }

    var jaCarregou = false;

    $scope.$watch('$viewContentLoaded', function() {


/*
        window.localStorage.setItem("environment_homolog", "http://191.101.11.129");
        window.localStorage.setItem("environment_dev", "http://192.168.0.12:8180");
        window.localStorage.setItem("environment_prod", "http://191.101.237.235");

*/

        window.localStorage.setItem("environment_homolog", "http://homolog.multisongs.audio");
        window.localStorage.setItem("environment_dev", "http://192.168.0.12:8180");
        window.localStorage.setItem("environment_prod", "http://api.multisongs.audio");

        //window.localStorage.setItem("subscription_id", "audio.multisongs.premium_account");

        window.localStorage.setItem("discount_id", "");
        
        window.localStorage.setItem("environment_name", "environment_prod");

        window.localStorage.setItem("environment", window.localStorage.getItem(window.localStorage.getItem("environment_name")));
        //window.localStorage.setItem("shouldFinishPurchase", true); // COLOCAR TRUE PARA PRODUCAO

    });
    
    
});

