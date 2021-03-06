module.factory('miniPlayer', function($q, 
                                      $ionicModal, 
                                      $ionicPopup, 
                                      $rootScope,  
                                      $ionicLoading, 
                                      $ionicScrollDelegate, 
                                      msPlayer, 
                                      auth, 
                                      musicService){
     
    var DISPLAY_MAXIMIZED = 1;
    var DISPLAY_NORMAL = 2;
    var DISPLAY_MINIMIZED = 3;


    var miniPlayerObj = {isPlaying : false, 
                         displayStatus : DISPLAY_MAXIMIZED, 
                         token : null, 
                         showDownload : true, 
                         showInstruments : true, 
                         showLyrics : false,
                         showReconfigurationWarning : false};

    return {

        DISPLAY_MAXIMIZED : DISPLAY_MAXIMIZED,
        DISPLAY_NORMAL : DISPLAY_NORMAL,
        DISPLAY_MINIMIZED : DISPLAY_MINIMIZED,

        auth : auth,

        lyricsClass : "button small-button-category-selected",
        instrumentsClass : "button small-button-category",

        play : function(musicId, playerType){

            console.log("==============>>>>>>>>>> musicId = " + musicId + "; playerType = " + playerType);

            if ((!msPlayer.getPlayer().status.isPlaying || 
                (msPlayer.getPlayer().status.isPlaying) && 
                (msPlayer.getPlayer().currentMusic.music.musicId != musicId) || (msPlayer.getPlayer().type != playerType))) {

                msPlayer.setLyricsChangedCallback(function(lyricsIdx){

                    if ($ionicScrollDelegate.$getByHandle('lyricsScrollHandle') && $ionicScrollDelegate.$getByHandle('lyricsScrollHandle').getScrollPosition()){

                        if (lyricsIdx % 3 == 0 || 
                            Math.abs((lyricsIdx-1>0?lyricsIdx-1:lyricsIdx) * 31 - $ionicScrollDelegate.$getByHandle('lyricsScrollHandle').getScrollPosition().top) > 155 ){
                            $ionicScrollDelegate.$getByHandle('lyricsScrollHandle').scrollTo(0, ((lyricsIdx-1>0?lyricsIdx-1:lyricsIdx) * 31), true);
                        }

                    }

                });

                msPlayer.suspend(function(){

                    msPlayer.unloadSetlist(function(){

                        msPlayer.loadMusic(musicId, true, playerType, function(obj){

                            if (obj.success == true){

                                if (msPlayer.getPlayer().currentMusic.music.status == 1){
                                    miniPlayerObj.showReconfigurationWarning = true;
                                }else{
                                    miniPlayerObj.showReconfigurationWarning = false;
                                }

                                if (msPlayer.getPlayer().currentMusic.cifra.fraseIdx == -1){
                                    miniPlayerObj.displayStatus = DISPLAY_NORMAL;
                                } else {
                                    miniPlayerObj.displayStatus = DISPLAY_MAXIMIZED;
                                }

                            }

                        });

                    });

                })

            }

        },

        showLyrics : function(){
            miniPlayerObj.showInstruments = false;
            miniPlayerObj.showLyrics = true;
            this.lyricsClass = "button small-button-category-selected";
            this.instrumentsClass = "button small-button-category";
        },

        showInstruments : function(){

            miniPlayerObj.showInstruments = true;
            miniPlayerObj.showLyrics = false;
            this.lyricsClass = "button small-button-category";
            this.instrumentsClass = "button small-button-category-selected";

            if (miniPlayerObj.showReconfigurationWarning){
                
                //$ionicLoading.show({ template: 'Ao reconfigurar a música, faça o download dela novamente para poder usá-la em suas playlists! ;)', animation: 'fade-in', noBackdrop: true, duration:3000});
                miniPlayerObj.showReconfigurationWarning = false;

            }

        },


        suspend : function(){

            msPlayer.suspend();

            miniPlayerObj.isPlaying = false;

        },

        shouldShowInstruments : function(){
            return miniPlayerObj.showInstruments;
        },

        shouldShowLyrics : function(){
            return miniPlayerObj.showLyrics;
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

        getMSPlayer : function(){
            return msPlayer;
        },

        getDisplayStatus : function(){
            return miniPlayerObj.displayStatus;
        },

        changeEnabled : function(track){

            if (track.enabled == false){
                msPlayer.unMute(track);
            } else {
                msPlayer.mute(track);
            }

        },

        changeSolo : function(track){

            if (track.solo == false){
                msPlayer.activateSolo(track);
            } else {
                msPlayer.unactivateSolo(track);
            }

        },

        changeDisplayStatus : function(newStatus){

            miniPlayerObj.displayStatus = newStatus;

        },

        verifyIfLoginIsNeededBeforeDownload : function(){

            var promises = [];

            if (auth.type == 1){

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

                if (msPlayer.getPlayer().currentMusic.status == 1){ // Musica ja comprada anteriormente. Somente realizando novo download

                    var confirmPopup = $ionicPopup.confirm({
                      title: 'Sobreposição de Música!',
                      template: 'Você quer sobrepor as suas configurações anteriores por essa nova configuração?'
                    });

                    confirmPopup.then(function(res) {
                        if(res) {
                            msPlayer.download();
                        }
                    });

                } else {

                    if (msPlayer.getPlayer().currentMusic.price == 0){ // Se musica gratuita...
                        
                        msPlayer.download();

                    }else{

                        msPlayer.download();

                    }


                }


            }


        }

    }

});