module.factory('miniPlayer', function($q, $ionicModal, $ionicPopup, $rootScope, msPlayer, auth, musicService){
     
    var miniPlayerObj = {isPlaying : false, playerExpanded : true, token : null, showDownload : true};

    var download = function(callbackFunction){

        var promisses = [];

        console.log("Will start download...");
        promisses.push(musicService.buy(msPlayer.getPlayer().currentMusic.music.musicId, auth.token));

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

    };


    return {

        STATUS_UNAVAILABLE : msPlayer.STATUS_UNAVAILABLE,
        STATUS_INITIAL : msPlayer.STATUS_INITIAL,
        STATUS_PLAYING : msPlayer.STATUS_PLAYING,
        STATUS_PAUSED : msPlayer.STATUS_PAUSED,

        PLAYER_TYPE_NOT_DEFINED_YET : msPlayer.PLAYER_TYPE_NOT_DEFINED_YET,
        PLAYER_TYPE_MULTITRACK : msPlayer.PLAYER_TYPE_MULTITRACK,
        PLAYER_TYPE_SINGLETRACK : msPlayer.PLAYER_TYPE_SINGLETRACK,
        PLAYER_TYPE_SINGLETRACK_LOCAL : msPlayer.PLAYER_TYPE_SINGLETRACK_LOCAL,
        PLAYER_TYPE_SETLIST : msPlayer.PLAYER_TYPE_SETLIST,

        auth : auth,


        loadPlayer : function(){

            //miniPlayerObj.playerExpanded = true;

            miniPlayerObj.msPlayer = msPlayer;

            miniPlayerObj.token = auth.token;

            isAnApp = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

            if ( isAnApp ) {
                
                msPlayer.setFileSystem(cordova.file.dataDirectory);

            }else{
            }

        },

        play : function(musicId, playerType){

            console.log("=========>>>>>>>>>>>>> PLAYERTYPE: " + playerType);

                if (!msPlayer.getPlayer().status.isPlaying || 
                    msPlayer.getPlayer().status.isPlaying && 
                    msPlayer.getPlayer().currentMusic.music.musicId != musicId){
                        msPlayer.loadMusic(musicId, true, playerType);
                }

        },

        suspend : function(){

            msPlayer.suspend();

            miniPlayerObj.isPlaying = false;

        },

        showDownload : function(showDownload){
            miniPlayerObj.showDownload = showDownload;
        },

        shouldShowDownload : function(){
            return miniPlayerObj.showDownload;
        },

        resume : function(musicDetail){

            if (msPlayer.getPlayer().status.isPaused){ //IS_SUSPENDED_STATUS

                msPlayer.resume();

            } else {
                
                msPlayer.play();

            }

            miniPlayerObj.isPlaying = true;

            //intervalToMusicPosition = $interval(function(){$scope.timer.value++;}, 240 * 1000 / 100, 100 - $scope.timer.value);

        },

        getPlayer : function(){
            return msPlayer.getPlayer();
        },

        isExpanded : function(){
            return miniPlayerObj.playerExpanded;
        },

        changePlayerExpantion : function(){
            miniPlayerObj.playerExpanded = (miniPlayerObj.playerExpanded == false);
        },

        verifyIfLoginIsNeededBeforeDownload : function(){

            var promises = [];

            if (auth.type == 1){
/*
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Download restrito.',
                    template: 'Você precisa entrar na sua conta para usar essa música. Deseja entrar em sua conta agora?'
                });

                confirmPopup.then(function(res) {

                    if(res) {
*/
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
/*
                    } else {

                    }

                });
*/
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

                    if (msPlayer.getPlayer().currentMusic.price == 0){ // Se musica gratuita...
                        
                        download();

                    }else{

                        download();

                    }


                }


            }


        }

    }

});