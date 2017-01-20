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

    $scope.verifyIfLoginIsNeededBeforeDownload = function(){

        var promises = [];
        var productId;

        productId = "audio.multisongs.multitrack." + $stateParams.musicId;

        if (auth.type == 1){

            var confirmPopup = $ionicPopup.confirm({
                title: 'Login needed.',
                template: 'You have to be logged in to download this song. Do you want to go to your login area now?'
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
                  title: 'Song Replacement!',
                  template: 'Do you really want to use this version on your playlists instead of the previous one?'
                });

                confirmPopup.then(function(res) {
                    if(res) {
                        download();
                    }
                });

            } else {

                if (msPlayer.getPlayer().currentMusic.price == 0){ // Se musica gratuita...
                    
                    download();

                }else{

                    // SO REALIZA A COMPRA SE ESTIVER CONFIGURADO PARA ISSO
                    //if (window.localStorage.getItem("shouldFinishPurchase") == true){
                        store.order(productId); // O evento approved da Store ira chamar o finishPurchase.
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

                initStore();

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

    var initStore = function(){

        var productId = "audio.multisongs.multitrack." + $stateParams.musicId;
        var promisses = [];

        $rootScope.musicId = $stateParams.musicId;

        // Let's set a pretty high verbosity level, so that we see a lot of stuff
        // in the console (reassuring us that something is happening).
        store.verbosity = store.DEBUG;

        if (!store.products.byId[productId]){

            console.log("Product " + productId + " was not registered before.");

            // We register a dummy product. It's ok, it shouldn't
            // prevent the store "ready" event from firing.
            store.register({
                id:    productId,
                alias: $stateParams.musicId,
                type:  store.CONSUMABLE
            });

            store.when(productId).updated(function (product) {
                console.log(product);
                $rootScope.store = {price : product.price};
                window.localStorage.setItem(product.id, product.price);
            });

            store.when(productId).approved(function (product){
                download();
                product.finish();
            });

        }else{
            console.log(window.localStorage.getItem(productId));
            $rootScope.store = {price : window.localStorage.getItem(productId)};
        }

        // When every goes as expected, it's time to celebrate!
        // The "ready" event should be welcomed with music and fireworks,
        // go ask your boss about it! (just in case)
        store.ready(function() {
            console.log("\\o/ STORE READY \\o/");
        });

        // After we've done our setup, we tell the store to do
        // it's first refresh. Nothing will happen if we do not call store.refresh()
        store.refresh();

    }
/*
    var finishPurchase = function(product){


        var startDownload;

        var alertPopup = $ionicPopup.alert({
          title: 'Song was successfully purchased!',
          template: 'Your backing track was successfully purchased and your download will start now.'
        });

        alertPopup.then(function(res) {
            donwload();
            product.finish();
        });

    }
*/
    var download = function(callbackFunction){

        var promisses = [];

        console.log("Will start download...");

        promisses.push(musicService.buy($scope, $stateParams.musicId, auth.token));

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
