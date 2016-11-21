module.controller('ConfigController', function($scope,
                                               $rootScope,
                                               $ionicNavBarDelegate,
                                               $location,
                                               $ionicPopup,
                                               $ionicModal,
                                               auth,
                                               msSessionConfig,
                                               loginService) {

    $scope.logout = function(){
/*
        var key = msSessionConfig.defaultUser;
        var password = msSessionConfig.defaultPassword;
*/

        var key = window.localStorage.getItem("defaultKey");
        var password = window.localStorage.getItem("defaultPassword");

        window.localStorage.setItem("key", key);
        window.localStorage.setItem("password", password);

        var alertPopup = $ionicPopup.alert({
            title: $rootScope.i18.general.loggedOutMessage,
            template: $rootScope.i18.general.loggedOutDescriptionMessage
        });

        alertPopup.then(function(res) {
            $rootScope.buffer.config.valid = false; // Faz com que o config seja recarregado com o idioma do usuario logado.
            $rootScope.buffer.sugestions.valid = false; // Faz com que o sugestions seja recarregado com o recomendacoes do usuario logado.
            $location.path("/"); 
        });
             
    }

    $scope.openLogin = function(){

        $rootScope.description = $rootScope.i18.general.loginDescriptionMessage;
        $rootScope.originalDescription = $rootScope.description;

        $rootScope.callback = {func : function(args){$scope.userType = auth.type}, args : "args"};

        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $rootScope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $rootScope.loginModal = modal;
            $rootScope.loginModal.show();
        });

    }

    $scope.openPage = function(url){
        window.open(url, '_system');
    }

    $scope.$watch('$viewContentLoaded', function() {
        $scope.userType = auth.type;
    });        

});

