module.controller('IndexController', function($scope, 
                                              $rootScope,
                                              $q,
                                              $ionicNavBarDelegate,
                                              $ionicListDelegate,
                                              $rootScope,
                                              $ionicModal,
                                              $interval,
                                              featuredMusicService, 
                                              musicService, 
                                              artistService, 
                                              loginService,
                                              configService,
                                              styleService,
                                              auth,
                                              msSessionConfig) {

    //$ionicNavBarDelegate.showBar(true);




    $scope.openMusicModal = function(music){

        $scope.modal.show();

    }

    var changeFavoriteIfLogged = function(music){

        var promises = [];
        
        $ionicListDelegate.closeOptionButtons();

        promises.push(musicService.changeFavorite($scope, auth.token, music.musicId));

        $q.all(promises).then(
            function(response) { 
            }
        );

    }

    $scope.changeFavorite = function(music){
        
        loginService.validateAuthorization($rootScope.i18.general.bloquedResourceMessage, changeFavoriteIfLogged, music);

    };

    var onLoad = function(token, userType){

        var promises = [];

        $rootScope.environment = window.localStorage.getItem("environment");

        auth.token = token;
        auth.type = userType;

        $scope.token = auth.token;

        if (!$rootScope.buffer){
            $rootScope.buffer = {styles : {valid : false}, sugestions : {valid : false}, topMusics : {valid : false}, newSongs : {valid : false}, config : {valid : false}, featuredMusicSet : [], featuredMusicSets : {valid : false}, topArtists : {valid : false}};
        }

        promises.push(configService.getConfig($rootScope, $scope, token, msSessionConfig));
        promises.push(featuredMusicService.getFeaturedMusicSets($rootScope, $scope, token));
        promises.push(musicService.getNewSongs($rootScope, $scope, token));
        promises.push(musicService.getTopMusics($rootScope, $scope, token, 5));
        promises.push(artistService.getTopArtists($rootScope, $scope, token, 5));
        promises.push(styleService.getStyles($rootScope, $scope, token));
        //promises.push(wishlistService.getWishlists($scope, response.token));
        
        $q.all(promises).then(

            function(response) { 

                var general = {

                    notLoggedInMessage : response[0].generalBean.notLoggedInMessage,
                    passwordLabel : response[0].generalBean.passwordLabel,
                    forgotPasswordMessage : response[0].generalBean.forgotPasswordMessage,
                    createAccountLabel : response[0].generalBean.createAccountLabel,
                    nameLabel : response[0].generalBean.nameLabel,
                    idiomLabel : response[0].generalBean.idiomLabel,
                    countryLabel : response[0].generalBean.countryLabel, 
                    createAccount : response[0].generalBean.createAccount,
                    storeMenuTitleLabel : response[0].generalBean.storeMenuTitleLabel,
                    wishlistMenuTitleLabel : response[0].generalBean.wishlistMenuTitleLabel,
                    setlistMenuTitleLabel : response[0].generalBean.setlistMenuTitleLabel,
                    musicMenuTitleLabel : response[0].generalBean.musicMenuTitleLabel,
                    configMenuTitleLabel : response[0].generalBean.configMenuTitleLabel,
                    emailLabel : response[0].generalBean.emailLabel,
                    loginDescriptionMessage : response[0].generalBean.loginDescriptionMessage,
                    bloquedResourceMessage : response[0].generalBean.bloquedResourceMessage,
                    loggedInMessage : response[0].generalBean.loggedInMessage,
                    createAccountDescriptionMessage : response[0].generalBean.createAccountDescriptionMessage,
                    loginErrorDescriptionMessage : response[0].generalBean.loginErrorDescriptionMessage,
                    loggedOutMessage : response[0].generalBean.loggedOutMessage,
                    loggedOutDescriptionMessage : response[0].generalBean.loggedOutDescriptionMessage,
                    loggedInDescriptionMessage : response[0].generalBean.loggedInDescriptionMessage,
                    buyLabel : response[0].generalBean.buyLabel,
                    removeLabel : response[0].generalBean.removeLabel,
                    logoutLabel : response[0].generalBean.logoutLabel,
                    loginLabel : response[0].generalBean.loginLabel,
                    editLabel : response[0].generalBean.editLabel,
                    removeLabel : response[0].generalBean.removeLabel,
                    saveLabel : response[0].generalBean.saveLabel,
                    wishlistButtonLabel : response[0].generalBean.wishlistButtonLabel


                };

                var store = {

                    barTitleLabel : response[0].storeBean.barTitleLabel,
                    newSongsLabel : response[0].storeBean.newSongsLabel,
                    topSongsLabel : response[0].storeBean.topSongsLabel,
                    stylesLabel : response[0].storeBean.stylesLabel,
                    topArtistsLabel : response[0].storeBean.topArtistsLabel,
                    newSongsButtonLabel : response[0].storeBean.newSongsButtonLabel,
                    topSongsButtonLabel : response[0].storeBean.topSongsButtonLabel,
                    topArtistsButtonLabel : response[0].storeBean.topArtistsButtonLabel

                };

                var wishlist = {
                    suggestionsLabel : response[0].wishlistBean.suggestionsLabel,
                    barTitleLabel : response[0].wishlistBean.barTitleLabel,
                    playbacksLabel : response[0].wishlistBean.playbacksLabel,
                    tutorialLabel : response[0].wishlistBean.tutorialLabel,
                    tutorialDescriptionLabel : response[0].wishlistBean.tutorialDescriptionLabel
                };

                var setlist = {
                    barTitleLabel : response[0].setlistBean.barTitleLabel,
                    addLabel : response[0].setlistBean.addLabel,
                    createLabel : response[0].setlistBean.createLabel,
                    nameLabel : response[0].setlistBean.nameLabel,
                    typeLabel : response[0].setlistBean.typeLabel,
                    showLabel : response[0].setlistBean.showLabel,
                    rehearsalLabel : response[0].setlistBean.rehearsalLabel,
                    presentationLabel : response[0].setlistBean.presentationLabel,
                    trainningLabel : response[0].setlistBean.trainningLabel,
                    classLabel : response[0].setlistBean.classLabel,
                    otherLabel : response[0].setlistBean.otherLabel,
                    tutorialLabel :  response[0].setlistBean.tutorialLabel,
                    tutorialDescriptionLabel : response[0].setlistBean.tutorialDescriptionLabel
                };

                var musics = {
                    backingTracksLabel : response[0].musicsBean.backingTracksLabel,
                    recentlyAddedLabel : response[0].musicsBean.recentlyAddedLabel,
                    barTitleLabel : response[0].musicsBean.barTitleLabel,
                    tutorialLabel : response[0].musicsBean.tutorialLabel,
                    tutorialDescriptionLabel : response[0].musicsBean.tutorialDescriptionLabel
                };

                var search = {
                    resultLabel : response[0].searchBean.resultLabel,
                    playbacksLabel : response[0].searchBean.playbacksLabel,
                    artistsLabel : response[0].searchBean.artistsLabel,
                    stylesLabel : response[0].searchBean.stylesLabel,
                    studiosLabel : response[0].searchBean.studiosLabel,
                    albunsLabel : response[0].searchBean.albunsLabel
                };

                var player = {
                    modeLabel : response[0].playerBean.modeLabel,
                    setlistLabel : response[0].playerBean.setlistLabel,
                    automaticLabel : response[0].playerBean.automaticLabel,
                    manualLabel : response[0].playerBean.manualLabel,
                    freeDownloadLabel : response[0].playerBean.freeDownloadLabel,
                    downloadCompleteLabel : response[0].playerBean.downloadCompleteLabel,
                    downloadingLabel : response[0].playerBean.downloadingLabel,
                    availableLabel : response[0].playerBean.availableLabel
                };

                var config = {
                    descriptionLabel : response[0].configBean.descriptionLabel,
                    socialLabel : response[0].configBean.socialLabel,
                    disclaimerLabel : response[0].configBean.disclaimerLabel,
                    barTitleLabel : response[0].configBean.barTitleLabel
                };

                var setlistDetail = {
                    barTitleLabel : response[0].setlistDetailBean.barTitleLabel,
                    setlistMusicsLabel : response[0].setlistDetailBean.setlistMusicsLabel,
                    tutorialLabel : response[0].setlistDetailBean.tutorialLabel,
                    tutorialDescriptionLabel : response[0].setlistDetailBean.tutorialDescriptionLabel,
                    automaticOptionLabel : response[0].setlistDetailBean.automaticOptionLabel,
                    manualOptionLabel : response[0].setlistDetailBean.manualOptionLabel,
                    addRemoveButtonLabel : response[0].setlistDetailBean.addRemoveButtonLabel,
                    musicSelectionLabel : response[0].setlistDetailBean.musicSelectionLabel,
                    totalTimeLabel : response[0].setlistDetailBean.totalTimeLabel
                };


                $rootScope.i18 = {general : general, 
                                  store : store, 
                                  wishlist : wishlist, 
                                  musics : musics, 
                                  search : search, 
                                  setlist : setlist, 
                                  player : player,
                                  setlistDetail : setlistDetail,
                                  config : config};
                
                msSessionConfig.storeBarTitle = response[0].storeBarTitle;
                msSessionConfig.myWishlistBarTitle = response[0].myWishlistSongsBarTitle;
                msSessionConfig.mySongsBarTitle = response[0].mySongsBarTitle;
                msSessionConfig.mySetListsBarTitle = response[0].mySetListsBarTitle;

                msSessionConfig.newSongsButtom = response[0].newSongsButtom;
                msSessionConfig.topSongsButtom = response[0].topSongsButtom;
                msSessionConfig.topArtistsButtom = response[0].topArtistsButtom;
                msSessionConfig.stylesButtom = response[0].stylesButtom;

                msSessionConfig.storeMenu = response[0].storeMenu;
                msSessionConfig.wishlistMenu = response[0].wishlistMenu;
                msSessionConfig.musicMenu = response[0].musicMenu;
                msSessionConfig.setlistMenu = response[0].setlistMenu;
                msSessionConfig.configMenu = response[0].configMenu;


                $scope.featuredSongs = response[1].featured;
                
                $scope.newSongsRow1 = response[2].musicas.slice(0,3);
                $scope.newSongsRow2 = response[2].musicas.slice(3,6);

                $scope.newSongsRow1[0].margin="margin-right:6px";
                $scope.newSongsRow1[1].margin="margin-right:3px;margin-left:3px";
                $scope.newSongsRow1[2].margin="margin-left:6px";

                $scope.newSongsRow2[0].margin="margin-right:6px";
                $scope.newSongsRow2[1].margin="margin-right:3px;margin-left:3px";
                $scope.newSongsRow2[2].margin="margin-left:6px";
                
                $scope.topMusics = response[3].musicas;

                $scope.topArtists = response[4].artistas;
                
                $ionicNavBarDelegate.showBar(true);
                $ionicNavBarDelegate.title($rootScope.i18.store.barTitleLabel);
                
                $scope.wishlist = response[5];

                if ($scope.wishlist) {

                    for (var idx = 0; idx < $scope.wishlist.length; idx++){
                        
                        $scope.topMusics[idy].favorite = false;
                        
                        for (var idy = 0; idy < $scope.topMusics.length; idy++){
                            
                            if ($scope.topMusics[idy].id == $scope.wishlist[idx].id){
                                $scope.topMusics[idy].favorite = true;
                            }
                            
                        }
                        
                    }

                }

                //$scope.loadingModal.hide();
                
            },
            function() { 
                $scope.teste = 'Failed'; 
            }
        ).finally(function() {
        });
               
    }

    $scope.$watch("$viewContentLoaded", function() {

        var key;
        var password;

        $scope.loginData = {key: "", password: ""};

        $ionicModal.fromTemplateUrl('templates/level.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $ionicModal.fromTemplateUrl('templates/language.html', {
            scope: $rootScope,
            animation: 'slide-in-up'
        }).then(function(modal) {

            $rootScope.languageModal = modal;

            if (window.localStorage.getItem("key")){

                key = window.localStorage.getItem("key");
                password = window.localStorage.getItem("password");
                
                loginService.login($scope, key, password, function(response){
                   
                    $interval(function(){
                        cordova.exec(function(message){console.log(message)}, function(erro){console.log("ERRO ao chamar log!" + erro)}, "MultiSongsPlugin", "log", []);
                    },100);

                    onLoad(response.token, response.userType);

                });

            } else {
                $rootScope.languageModal.show();
            }

        });

    });


var teste = function(token){

    timerBasedPlayer.load(token, 336, false, 10, function(){
        timerBasedPlayer.play();
    });

}

/*

    var teste = function(token){
        html5Player.create("audio/mp3");
        html5Player.addNode("http://172.21.0.170:8180/MultiSongs/api/download/music/4072063611479431601497-12620/342/false");
        html5Player.addNode("http://172.21.0.170:8180/MultiSongs/api/download/music/4072063611479431601497-12620/343/false");
        html5Player.addNode("http://172.21.0.170:8180/MultiSongs/api/download/music/4072063611479431601497-12620/344/false");
        html5Player.addNode("http://172.21.0.170:8180/MultiSongs/api/download/music/4072063611479431601497-12620/346/false");
        html5Player.addNode("http://172.21.0.170:8180/MultiSongs/api/download/music/4072063611479431601497-12620/347/false");
        html5Player.play();
    }
*/
/*
    var teste = function(token){


        var audioCtx = new AudioContext();

        var myAudio1 = document.getElementById('teste1');
        var myAudio2 = document.getElementById('teste2');
        var myAudio3 = document.getElementById('teste3');
        var myAudio4 = document.getElementById('teste4');
        var myAudio5 = document.getElementById('teste5');

        // Create a MediaElementAudioSourceNode
        // Feed the HTMLMediaElement into it
        var source1 = audioCtx.createMediaElementSource(myAudio1);
        var source2 = audioCtx.createMediaElementSource(myAudio2);
        var source3 = audioCtx.createMediaElementSource(myAudio3);
        var source4 = audioCtx.createMediaElementSource(myAudio4);
        var source5 = audioCtx.createMediaElementSource(myAudio5);

        //console.log(source);

        // Create a gain node
        var gainNode = audioCtx.createGain();

    gainNode.gain.value = 1;
    myAudio1.volume = 1;
    myAudio2.volume = 1;
    myAudio3.volume = 1;
    myAudio4.volume = 1;
    myAudio5.volume = 1;

        // connect the AudioBufferSourceNode to the gainNode
        // and the gainNode to the destination, so we can play the
        // music and adjust the volume using the mouse cursor
        source1.connect(gainNode);
        source2.connect(gainNode);
        source3.connect(gainNode);
        source4.connect(gainNode);
        source5.connect(gainNode);
        gainNode.connect(audioCtx.destination);
console.log("TA CERTO...");
        myAudio1.play();  
        myAudio2.play();  
        myAudio3.play();  
        myAudio4.play();  
        myAudio5.play();  

    }
*/
});

