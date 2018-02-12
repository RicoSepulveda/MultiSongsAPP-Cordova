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
                         showInstruments : false, 
                         showLyrics : true,
                         showReconfigurationWarning : false};
/*
    var download = function(callbackFunction){

        var promisses = [];

        console.log("Will start download...");

        msPlayer.download();

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

*/

    return {
/*
        STATUS_UNAVAILABLE : msPlayer.STATUS_UNAVAILABLE,
        STATUS_INITIAL : msPlayer.STATUS_INITIAL,
        STATUS_PLAYING : msPlayer.STATUS_PLAYING,
        STATUS_PAUSED : msPlayer.STATUS_PAUSED,

        PLAYER_TYPE_NOT_DEFINED_YET : msPlayer.PLAYER_TYPE_NOT_DEFINED_YET,
        PLAYER_TYPE_MULTITRACK : msPlayer.PLAYER_TYPE_MULTITRACK,
        PLAYER_TYPE_SINGLETRACK : msPlayer.PLAYER_TYPE_SINGLETRACK,
        PLAYER_TYPE_SINGLETRACK_LOCAL : msPlayer.PLAYER_TYPE_SINGLETRACK_LOCAL,
        PLAYER_TYPE_SETLIST : msPlayer.PLAYER_TYPE_SETLIST,
*/
        DISPLAY_MAXIMIZED : DISPLAY_MAXIMIZED,
        DISPLAY_NORMAL : DISPLAY_NORMAL,
        DISPLAY_MINIMIZED : DISPLAY_MINIMIZED,

        auth : auth,

        lyricsClass : "button small-button-category-selected",
        instrumentsClass : "button small-button-category",
/*
        loadPlayer : function(){

            miniPlayerObj.msPlayer = msPlayer;

            miniPlayerObj.token = auth.token;

            isAnApp = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;


            if ( isAnApp ) {
                
                msPlayer.setFileSystem(cordova.file.dataDirectory);

            }else{
            }

        },
*/

        play : function(musicId, playerType){

            if ((!msPlayer.getPlayer().status.isPlaying || 
                (msPlayer.getPlayer().status.isPlaying) && 
                (msPlayer.getPlayer().currentMusic.music.musicId != musicId) || (msPlayer.getPlayer().type != playerType))) {

                msPlayer.setLyricsChangedCallback(function(lyricsIdx){

                    if ($ionicScrollDelegate.$getByHandle('lyricsScrollHandle') && $ionicScrollDelegate.$getByHandle('lyricsScrollHandle').getScrollPosition()){

                        if (lyricsIdx % 3 == 0 || 
                            Math.abs(lyricsIdx * 31 - $ionicScrollDelegate.$getByHandle('lyricsScrollHandle').getScrollPosition().top) > 155 ){
                            $ionicScrollDelegate.$getByHandle('lyricsScrollHandle').scrollTo(0, (lyricsIdx * 31), true);
                        }

                    }

                });

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

/*
        showDownload : function(showDownload){
            miniPlayerObj.showDownload = showDownload;
        },
*/
/*
        shouldShowDownload : function(){
            return miniPlayerObj.showDownload;
        },
*/
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