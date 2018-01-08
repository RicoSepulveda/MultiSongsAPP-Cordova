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
            msPlayer.unactivateSolo(track);
        } else {
            track.solo = true;
            msPlayer.activateSolo(track);
        }

    };

    $scope.verifyIfLoginIsNeededBeforeDownload = function(){

        var promises = [];
        var productId;

        productId = "audio.multisongs.multitrack." + $stateParams.musicId;

        if (auth.type == 1){

            var confirmPopup = $ionicPopup.confirm({
                title: 'Download restrito.',
                template: 'Você precisa entrar na sua conta para usar essa música. Deseja entrar em sua conta agora?'
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

            if (msPlayer.getPlayer().currentMusic.status == 1){ // Musica ja comprada anteriormente. Somente realizando novo download

                var confirmPopup = $ionicPopup.confirm({
                  title: 'Sobreposição de Música!',
                  template: 'Você quer sobrepor as suas configurações anteriores por essa nova configuração?'
                });

                confirmPopup.then(function(res) {
                    if(res) {
                        download();
                    }
                });

            } else {

                if (msPlayer.getPlayer().currentMusic.music.price == 0){ // Se musica gratuita...
                    
                    download();

                }else{

                    // SO REALIZA A COMPRA SE ESTIVER CONFIGURADO PARA ISSO
                    //if (window.localStorage.getItem("shouldFinishPurchase") == true){
                        download();
                        //store.order(productId); // O evento approved da Store ira chamar o finishPurchase.
                    //} else {
                    //    console.log("ATTENTION! =======>>>>>>> PURCHASE WAS NOT REGISTRED ON THE STORE! APP MUST BE RECONFIGURED AND REDEPLOYED.");
                    //    finishPurchase(); // Chama diretamente o finishPurchase sem o uso do evento da store
                    //}

                }


            }


        }


    }

    $scope.changeEnabled = function(track){

        if (track.enabled == true){
            msPlayer.mute(track);
        } else {
            track.enabled = true;
            msPlayer.unMute(track);
        }

    };

    $scope.changeLevel = function(track){

        msPlayer.changeLevel(track);

    };

    $scope.changeMasterLevel = function(){

        msPlayer.changeMasterLevel();

    };

    $scope.changeMasterPan = function(){

        msPlayer.changeMasterPan();

    };

    $scope.changePan = function(track){

        msPlayer.changePan(track);

    };

    $scope.suspend = function(){

        msPlayer.suspend();

        $scope.isPlaying = false;

    };

    $scope.changePosition = function(){

        msPlayer.changePosition();

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

        if(width<height){
            realWidth = width;
            realHeight = height;
            screenRatio = (height/width);
        } else {
            realWidth = height;
            realHeight = width;
            screenRatio = (width/height);
        }

        console.log("width:" + (realWidth - 80) + "px");

        document.getElementById('msLevelsLeft').setAttribute("style","width:240px");
        document.getElementById('msLevelsContent').setAttribute("style","width:" + (realWidth - 80) + "px");
        //document.getElementById('msLevelsLeft').setAttribute("style","width:" + 240 + "px");

    }

    $scope.$watch('$viewContentLoaded', function() {

        //$ionicNavBarDelegate.showBar(false);

        calculateLeftLevelsSize();

        $scope.msPlayer = msPlayer;

        $ionicNavBarDelegate.showBar(false);
        $scope.token = auth.token;

        $scope.slides  = {options : {autoplay:3000, autoplayDisableOnInteraction:true}};

        isAnApp = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

        if ( isAnApp ) {
            
            document.addEventListener("deviceready", function(){


                /* TODO - Reiniciar a store.... retirar comentario */
                //initStore();
                /*
                msPlayer.setFileSystem(cordova.file.dataDirectory);
                msPlayer.loadMusic($stateParams.musicId, true);
                */

                msPlayer.stop();

                msPlayer.setFileSystem(cordova.file.dataDirectory);
                
                msPlayer.loadMusic($stateParams.musicId, true, msPlayer.PLAYER_TYPE_MULTITRACK);

            }, false);

        }else{
            if (!msPlayer.getPlayer().status.isPlaying || msPlayer.getPlayer().status.isPlaying && msPlayer.getPlayer().currentMusic.music.musicId != $stateParams.musicId){
                msPlayer.unloadSetlist(); // Garante que se o usuario entrou no player multitrack depois de ter ido na playlist, remove a setlist.
                msPlayer.loadMusic($stateParams.musicId, true, msPlayer.PLAYER_TYPE_MULTITRACK);
            }
        }

        
    });

    var download = function(callbackFunction){

        var promisses = [];

        console.log("Will start download...");

        promisses.push(musicService.buy($stateParams.musicId, auth.token));

        $q.all(promisses).then(
            function(response) { 

                if (callbackFunction){
                    callbackFunction();
                }

                msPlayer.download();

            },
            function(err) {
                // PRECISA TRATAR O ERRO NO DOWNLOAD
                console.log(err);
            }
        ).finally(function() {
            
        });

    }

});
