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


    $scope.chooseLanguage = function(lang){

        var loginData;

        if (lang == "port"){
            window.localStorage.setItem("defaultKey", msSessionConfig.portugueseDefaultUser);
            window.localStorage.setItem("defaultPassword", msSessionConfig.portugueseDefaultPassword);
            loginData = {key : msSessionConfig.portugueseDefaultUser, password : msSessionConfig.portugueseDefaultPassword};
        } else {
            window.localStorage.setItem("defaultKey", msSessionConfig.englishDefaultUser);
            window.localStorage.setItem("defaultPassword", msSessionConfig.englishDefaultPassword);
            loginData = {key : msSessionConfig.englishDefaultUser, password : msSessionConfig.englishDefaultPassword};
        }

        window.localStorage.setItem("key", loginData.key);
        window.localStorage.setItem("password", loginData.password);

        $rootScope.languageModal.hide();

        window.location.reload(true);
/*
        loginService.login($scope, $scope.loginData.key, $scope.loginData.password, function(response){
            onLoad(response.token, response.userType);
        });
*/
    }    

    $scope.createAccount = function(){

        loginService.createAccount(auth.token, $rootScope.createAccountData.key, $rootScope.createAccountData.password, $rootScope.createAccountData.name, $rootScope.createAccountData.idiom, $rootScope.createAccountData.country, function(response){
            if (response.success == true){
                
                $rootScope.createAccountModal.hide(); 

                auth.token = response.token;
                auth.type = response.userType;
                
                window.localStorage.setItem("key", $rootScope.createAccountData.key);
                window.localStorage.setItem("password", $rootScope.createAccountData.password);

                var alertPopup = $ionicPopup.alert({
                    title: $rootScope.i18.general.loggedInMessage,
                    template: $rootScope.i18.general.loggedInDescriptionMessage
                });

                alertPopup.then(function(res) {
                    $location.path("/");
                });

            } else {

                $rootScope.originalDescription = $rootScope.description;
                $rootScope.description = response.message;

                $rootScope.descriptionClass = "ms-font-multisongs";

            }
        })

    }

    $scope.openCreateAccountModal = function(){

        $rootScope.loginModal.hide();

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

    }

    $scope.changeUser = function(){

        // Fica indefinido quando usuario nao preenche os dados no form...
        if (!$scope.loginData){
            $scope.loginData = {key : "", password : ""};
        }

        loginService.login($scope, 
                           $scope.loginData.key, 
                           $scope.loginData.password, 
                           function(response){

            if (response.success == true){

                $rootScope.buffer.config.valid = false; // Faz com que o config seja recarregado com o idioma do usuario logado.
                $rootScope.buffer.sugestions.valid = false; // Faz com que o sugestions seja recarregado com o sugestoes do usuario logado.
                $location.path("/");
                
                window.localStorage.setItem("key", $scope.loginData.key);
                window.localStorage.setItem("password", $scope.loginData.password);
                
                auth.token = response.token;
                auth.type = response.userType;

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



        //window.localStorage.setItem("environment_dev", "http://172.21.0.170:8180");
        window.localStorage.setItem("environment_homolog", "http://191.101.237.235");
        //window.localStorage.setItem("environment_dev", "http://192.168.0.12:8180");
        window.localStorage.setItem("environment_prod", "http://www.multisongs.audio");

        window.localStorage.setItem("environment_name", "environment_homolog");

        window.localStorage.setItem("environment", window.localStorage.getItem(window.localStorage.getItem("environment_name")));
        //window.localStorage.setItem("shouldFinishPurchase", true); // COLOCAR TRUE PARA PRODUCAO

    });
    
    
});

