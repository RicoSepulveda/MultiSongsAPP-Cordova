module.controller('TrackController', function($scope, 
                                              $q,
                                              $ionicNavBarDelegate,
                                              $rootScope,
                                              $stateParams,
                                              $interval, 
                                              musicService,
                                              $ionicPopup,
                                              $ionicModal,
                                              auth,
                                              msSessionConfig,
                                              msPlayer) {

    var intervalToMusicPosition;
    var fileSystem;
    var isAnApp;

    $scope.changeSolo = function(track){

        if (track.solo == true){
            track.solo = false;
            msPlayer.unactivateSolo($scope, track);
        } else {
            track.solo = true;
            msPlayer.activateSolo($scope, track);
        }

    };

    $scope.download = function(){

        var promises = [];

        if (auth.type == 1){

            var confirmPopup = $ionicPopup.confirm({
                title: 'Login necessário',
                template: 'Para realizar o download dessa música você precisa estar logado. Deseja fazer seu login agora?'
            });

            confirmPopup.then(function(res) {

                if(res) {

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

                } else {

                }

            });

        } else {

            promises.push(musicService.buy($scope, $stateParams.musicId, auth.token));

            $q.all(promises).then(
                function(response) { 
                    msPlayer.download();
                },
                function() {
                    /* PRECISA TRATAR O ERRO NA COMPRA */
                }
            ).finally(function() {
            });

        }



    }

    $scope.changeEnabled = function(track){

        if (track.enabled == true){
            msPlayer.mute($scope, track);
        } else {
            track.enabled = true;
            msPlayer.unMute($scope, track);
        }

    };

    $scope.changeLevel = function(track){

        msPlayer.changeLevel($scope, track);

    };

    $scope.changeMasterLevel = function(){

        msPlayer.changeMasterLevel($scope);

    };

    $scope.changeMasterPan = function(){

        msPlayer.changeMasterPan($scope);

    };

    $scope.changePan = function(track){

        msPlayer.changePan($scope, track);

    };

    $scope.suspend = function(){

        msPlayer.suspend($scope);

        $scope.isPlaying = false;

    };

    $scope.changePosition = function(){

        msPlayer.changePosition($scope);

    };

    $scope.play = function(musicDetail){

        if ($scope.msPlayer.getPlayer().status.isPaused){ //IS_SUSPENDED_STATUS

            msPlayer.resume();

        } else {
            
            msPlayer.play();

        }

        $scope.isPlaying = true;

        //intervalToMusicPosition = $interval(function(){$scope.timer.value++;}, 240 * 1000 / 100, 100 - $scope.timer.value);

    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    var calculateLeftLevelsSize = function(){

        var width = screen.height;
        var height = screen.width;
        var screenRatio;
        var realWidth;
        var realHeight;

        if(width>height){
            realWidth = width;
            realHeight = height;
            screenRatio = (height/width);
        } else {
            realWidth = height;
            realHeight = width;
            screenRatio = (width/height);
        }

         document.getElementById('msLevelsLeft').setAttribute("style","width:" + (realWidth - 80) + "px");

    }

    $scope.$watch('$viewContentLoaded', function() {

        //$ionicNavBarDelegate.showBar(false);

        calculateLeftLevelsSize();

        $scope.msPlayer = msPlayer;

        $ionicNavBarDelegate.showBar(false);
        $scope.token = auth.token;

        isAnApp = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

        if ( isAnApp ) {
            
            document.addEventListener("deviceready", function(){
                msPlayer.setFileSystem(cordova.file.dataDirectory);
                msPlayer.loadMusic($stateParams.musicId);
            }, false);

        }else{
            if (!msPlayer.getPlayer().status.isPlaying || msPlayer.getPlayer().status.isPlaying && msPlayer.getPlayer().currentMusic.musicId != $stateParams.musicId){
                msPlayer.unloadSetlist(); // Garante que se o usuario entrou no player multitrack depois de ter ido na playlist, remove a setlist.
                msPlayer.loadMusic($stateParams.musicId);
            }
        }

        
    });

});
