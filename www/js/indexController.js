
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

    $scope.$watch('$viewContentLoaded', function() {

    });
    
    
});



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


module.controller('IndexController', function($scope, 
                                              $rootScope,
                                              $q,
                                              $ionicNavBarDelegate,
                                              $ionicListDelegate,
                                              $rootScope,
                                              $ionicModal,
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

/*
                //$scope.storeBarTitle = msSessionConfig.storeBarTitle;
                $scope.myWishlistBarTitle = msSessionConfig.myWishlistBarTitle;
                $scope.mySongsBarTitle = msSessionConfig.mySongsBarTitle;
                $scope.mySetlistsTitle = msSessionConfig.mySetlistsTitle;

                $scope.newSongsButtom = msSessionConfig.newSongsButtom;
                $scope.topSongsButtom = msSessionConfig.topSongsButtom;
                $scope.topArtistsButtom = msSessionConfig.topArtistsButtom;
                $scope.stylesButtom = msSessionConfig.stylesButtom;

                $scope.storeMenu = msSessionConfig.storeMenu;
                $scope.wishlistMenu = msSessionConfig.wishlistMenu;
                $scope.musicMenu = msSessionConfig.musicMenu;
                $scope.setlistMenu = msSessionConfig.setlistMenu;
                $scope.configMenu = msSessionConfig.configMenu;
*/
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
/*
        var key = msSessionConfig.defaultUser;
        var password = msSessionConfig.defaultPassword;
*/

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
                    onLoad(response.token, response.userType);
                });

            } else {
                $rootScope.languageModal.show();
            }

        });

    });

});

module.controller('FeaturedSongController', function($scope,
                                                     $rootScope,
                                                     $stateParams,
                                                     $q,
                                                     auth,
                                                     featuredMusicService) {

    $scope.$watch('$viewContentLoaded', function() {

        var promises = [];

        $scope.token = auth.token;

        promises.push(featuredMusicService.getFeaturedMusicSet($rootScope, $scope, auth.token, $stateParams.id));
        
        $q.all(promises).then(
            function(response) { 
                $scope.featuredSong = response[0].bean;
            },
            function() { 
                $scope.debugTxt = 'Failed'; 
            }
        ).finally(function() {
        });

    });


});

module.controller('SetlistController', function($scope, 
                                                $rootScope,
                                                $q,
                                                $ionicNavBarDelegate,
                                                $ionicListDelegate,
                                                $ionicPopup,
                                                $ionicModal,
                                                setlistService,
                                                auth,
                                                msSessionConfig,
                                                $location) {

    $ionicModal.fromTemplateUrl('templates/changeSetlists.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    
    $scope.openModal = function(setlist){
        
        $ionicListDelegate.closeOptionButtons();
        
        if (setlist === null){
            $scope.setlist = {name: "", id: -1, type: "OTHERS_SETLIST_GROUP"};
        }else{
            $scope.setlist = {name: setlist.title, id: setlist.id, type: setlist.group};
        }
        
        $scope.modal.show();
    };
        
    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    
    $scope.persistSetlist = function(){
        if ($scope.setlist.id > -1){
            $scope.updateSetlistAttributes();
        }else{
            $scope.createSetlist();
        }
        
    };
    
    $scope.createSetlist = function(){
        
        var promises = [];
        
        promises.push(setlistService.createSetlist($scope, auth.token, $scope.setlist.name, $scope.setlist.type));
        
        $q.all(promises).then(
            function(response) { 

                var alertPopup = $ionicPopup.alert({
                    title: 'SetList criada',
                    template: 'Sua SetList foi criada com sucesso. Agora você pode adicionar as músicas que você baixou à sua nova SetList.'
                });

                alertPopup.then(function(res) {
                    $scope.modal.hide();
                    $location.path("/setlistDetail/" + response[0].id);
                });

            },
            function() { 
                $scope.debugTxt = 'Failed'; 
            }

        ).finally(function() {
        });
        
    };
    
    $scope.removeSetlist = function(setlistId){
        
        var promises = [];
        
        promises.push(setlistService.removeSetlist($scope, auth.token, setlistId));
        
        $q.all(promises).then(
            function(response) {
                $scope.loadSetlists();
            },
            function(response) { 
                $scope.debugTxt = response; 
            }
        ).finally(function() {
            
        });
        
    };

    $scope.updateSetlistAttributes = function(){
        
        var promises = [];
        
        promises.push(setlistService.updateSetlistAttributes($scope, auth.token, $scope.setlist.id, $scope.setlist.name, $scope.setlist.type));
        
        $q.all(promises).then(
            function(response) { 
                $scope.modal.hide();
                $scope.loadSetlists();
            },
            function(response) { 
                $scope.debugTxt = response; 
            }
        ).finally(function() {
        });
        
    };
    
    $scope.loadSetlists = function(){
        
        var promises = [];
        var setlistGroups = {};
        
        promises.push(setlistService.getSetlists($scope, auth.token));
        
        $q.all(promises).then(
            function(response) { 

                response[0].setLists.forEach(function (entry){

                    if (!setlistGroups.hasOwnProperty(entry.group)){
                        setlistGroups[entry.group] = new Array();
                    }

                    setlistGroups[entry.group].push(entry);

                });

                $scope.setlistGroups = setlistGroups;

                $scope.setlistGroupsSize = response[0].setLists.length;

            },
            function(response) { 
                $scope.debugTxt = response; 
            }
        ).finally(function() {
        });

        
    };
    
    $scope.showConfirm = function(setlistId) {
        
        $ionicListDelegate.closeOptionButtons();
        
       var confirmPopup = $ionicPopup.confirm({
         title: 'Remover Setlist',
         template: 'Você deseja realmente remover a setlist? Essa ação não poderá ser desfeita.'
       });

       confirmPopup.then(function(res) {
         if(res) {
           $scope.removeSetlist(setlistId);
         } else {
           
         }
       });
     };

     var onLoad = function(){

        $ionicNavBarDelegate.showBar(true);
        $ionicNavBarDelegate.title(msSessionConfig.mySetListsBarTitle);
        
        $scope.$parent.showSearch = false;
        $scope.token = auth.token;
        
        $scope.loadSetlists();

     }

    $scope.$watch('$viewContentLoaded', function() {

        onLoad();
        
    });

});

module.controller('MyMusicsController', function($scope, 
                                                 $q,
                                                 $ionicNavBarDelegate,
                                                 $rootScope,
                                                 $ionicModal,
                                                 musicService,
                                                 auth,
                                                 msSessionConfig) {

    var onLoad = function(){

        $ionicNavBarDelegate.showBar(true);
        $ionicNavBarDelegate.title(msSessionConfig.mySongsBarTitle);
        
        $scope.$parent.showSearch = false;
    
        var promises = [];
        
        $scope.token = auth.token;
        
        promises.push(musicService.getRecentlyAdded($scope, auth.token));
        promises.push(musicService.getMyMusics($scope, auth.token));
        
        $q.all(promises).then(
            function(response) { 
                if (response[0].musicas.length > 3){
                    $scope.recentlyAddedMusics = response[0].musicas.slice(0, 3);
                }else{
                    $scope.recentlyAddedMusics = response[0].musicas;
                }
            },
            function() { 
                $scope.debugTxt = 'Failed'; 
            }
        ).finally(function() {
        });

    }

    $scope.$watch('$viewContentLoaded', function() {

        onLoad();

    });

});

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

    $scope.changeSolo = function(track){

        if (track.solo == true){
            track.solo = false;
            msPlayer.unactivateSolo($scope, track);
        } else {
            track.solo = true;
            msPlayer.activateSolo($scope, track);
        }

    };

    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {
        
        fileSystem = cordova.file.dataDirectory;

        msPlayer.new($scope);

        var promises = [];
        
        //$ionicNavBarDelegate.setTitle(msSessionConfig.mySongsBarTitle);
        
        promises.push(musicService.getMusicDetails($scope, auth.token, $stateParams.musicId));
        
        $q.all(promises).then(
            function(response) { 
                //$scope.debugTxt2 = "response: " + response;
                $scope.musicDetails = response[0].bean;
                msPlayer.loadMusic(fileSystem, $scope, $q, response[0].bean, auth.token);
            },
            function() { 
                $scope.debugTxt = 'Failed'; 
            }
        ).finally(function() {
        });

    }

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
                    msPlayer.download($scope);
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

        if ($scope.msPlayer.status == 3){ //IS_SUSPENDED_STATUS

            msPlayer.resume($scope);

        } else {
            
            msPlayer.play($scope);

        }

        $scope.isPlaying = true;

        //intervalToMusicPosition = $interval(function(){$scope.timer.value++;}, 240 * 1000 / 100, 100 - $scope.timer.value);

    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $scope.$watch('$viewContentLoaded', function() {

        //$ionicNavBarDelegate.showBar(false);

        $ionicNavBarDelegate.showBar(false);
        $scope.token = auth.token;
        $scope.isPlaying = false;
        
    });

});

module.controller('WishlistController', function($scope, 
                                                 $q,
                                                 $ionicNavBarDelegate,
                                                 $ionicListDelegate,
                                                 $rootScope,
                                                 $ionicModal,
                                                 $ionicSlideBoxDelegate,
                                                 $interval,
                                                 wishlistService,
                                                 musicService,
                                                 auth,
                                                 msSessionConfig) {

    $scope.changeFavorite = function(music){
        
        var promises = [];
        
        $ionicListDelegate.closeOptionButtons();

        promises.push(musicService.changeFavorite($scope, auth.token, music.musicId));
        
        $q.all(promises).then(
            function(response) { 
                $scope.wishList.splice($scope.wishList.indexOf(music), 1);
            }
        );
        
    };


    var onLoad = function(){

        $scope.$parent.showSearch = false;

        $ionicNavBarDelegate.showBar(true);
        $ionicNavBarDelegate.title(msSessionConfig.myWishlistBarTitle);
        
        var promises = [];
        
        $scope.token = auth.token;

        promises.push(wishlistService.getWishlists($scope, auth.token));
        promises.push(musicService.getSugestions($rootScope, $scope, auth.token));

        //$ionicNavBarDelegate.setTitle(msSessionConfig.myWishlistBarTitle);
        
        $q.all(promises).then(
            function(response) { 
                $scope.wishList = response[0].musicas;
                //$scope.sugestions = response[1].musicas;

                var remainder;
                var counter;
                var cardIndex;
                var sugestionIndex;

                counter = 0;
                cardIndex = -1;
                sugestionIndex = -1;

                $scope.sugestions = [];

                $scope.sugestions[0] = [];                        

                response[1].musicas.forEach(function (entry){

                    remainder = counter % 3;

                    if (remainder == 0) {

                        cardIndex++;
                        sugestionIndex = 0;

                        $scope.sugestions[cardIndex] = [];                        

                    } else {
                        sugestionIndex++;
                    }

                    $scope.sugestions[cardIndex][sugestionIndex] = entry;

                    entry.margin = (sugestionIndex==0)?"padding-right:2px;":
                                   (sugestionIndex==1 || sugestionIndex==2)?"padding-right:1px;padding-left:1px;":"padding-left:2px;";

                    counter++;

                });

                 $interval(function(){$ionicSlideBoxDelegate.update();}, 50, 1);

                



            },
            function() { 
                $scope.debugTxt = 'Failed'; 
            }
        ).finally(function() {
        });

    }
    
    $scope.$watch('$viewContentLoaded', function() {
    
        onLoad();

    });

});

module.controller('SearchController', function($scope, 
                                               $q,
                                               $stateParams,
                                               $ionicNavBarDelegate,
                                               $location,
                                               $interval,
                                               wishlistService,
                                               auth,
                                               searchService,
                                               msSessionConfig) {
    
    
    $scope.closeSearchWindow = function(){
        
        $ionicNavBarDelegate.showBar(true);
        //
        $location.path('/');
    };
    
    $scope.refreshData = function(){

        if ($scope.refreshDataInterval  && $scope.refreshDataInterval != null){
            $interval.cancel($scope.refreshDataInterval);
        }

        $scope.refreshDataInterval = $interval(function(){

            var promises = [];
        
            $scope.token = auth.token;
            
            promises.push(searchService.searchByKeyword($scope, auth.token, 10, $scope.search.keyword));
            
            $q.all(promises).then(
                function(response) {
                    $scope.byNameResult = response[0].musicsByName;
                    $scope.byArtistResult = response[0].musicsByArtistName;
                    $scope.byStyleResult = response[0].musicsByStyleName;
                    $scope.byStudioResult = response[0].musicsByStudioName;
                    $scope.byAlbumResult = response[0].musicsByAlbumName;
                    //$scope.refreshDataInterval = null;
                },
                function() { 
                    $scope.test = 'Failed'; 
                }
            );

        }, 1000, 1);

    };
    
    $scope.$watch('$viewContentLoaded', function() {
      
        $ionicNavBarDelegate.showBar(false);
        //$ionicNavBarDelegate.setTitle("Resultado da busca");
        $scope.search = {};
        $scope.search.keyword = "";
        
    });

});

module.controller('SearchByTypeController', function($scope, 
                                                     $q,
                                                     $ionicListDelegate,
                                                     $location,
                                                     $stateParams,
                                                     $ionicNavBarDelegate,
                                                     featuredMusicService,
                                                     auth,
                                                     musicService,
                                                     artistService,
                                                     searchService,
                                                     msSessionConfig) {
    
    
    $scope.changeFavorite = function(music){
        
        var promises = [];
        
        $ionicListDelegate.closeOptionButtons();

        promises.push(musicService.changeFavorite($scope, auth.token, music.musicId));

        $q.all(promises).then(
            function(response) { 
            }
        );
        
    };

    $scope.$watch('$viewContentLoaded', function() {

        $ionicNavBarDelegate.showBar(true);
        
        var promises = [];
    
        $ionicNavBarDelegate.showBackButton(true);

        $scope.token = auth.token;
        
        if ($stateParams.type == "1"){ // New Musics
            
            promises.push(musicService.getNewSongs($scope, auth.token));
            
        } else if ($stateParams.type == "2"){ // Top Musics
            
            promises.push(musicService.getTopMusics($scope, auth.token, 10));
            
        } else if ($stateParams.type == "3"){ // Top Artists
            //$scope.teste = "chamou....";
            promises.push(artistService.getTopArtists($scope, auth.token, 10));
            
        } else if ($stateParams.type == "4"){ // Top Artists
            //$scope.teste = "chamou....";
            promises.push(searchService.searchByType($scope, auth.token, 10, $stateParams.keyword, 1));
            
        } else if ($stateParams.type == "5"){ // Top Artists
            //$scope.teste = "chamou....";
            promises.push(searchService.searchByType($scope, auth.token, 10, $stateParams.keyword, 3));
            
        }

        
        $q.all(promises).then(
            function(response) {
                if ($stateParams.type == "3"){
                    $scope.artists = response[0].artistas;
                }else {
                    $scope.musics = response[0].musicas;
                }
                
                $scope.listTitle = response[0].title;
                
            },
            function(response) { 
                $scope.teste = response; 
            }
        );
        
    });

});

module.controller('SetlistPlayerController', function($scope, 
                                                      $q,
                                                      $ionicNavBarDelegate,
                                                      $rootScope,
                                                      $stateParams,
                                                      auth, 
                                                      musicService,
                                                      msSessionConfig, 
                                                      setlistService,
                                                      msPlayer) {


    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {
        
        fileSystem = cordova.file.dataDirectory;

        msPlayer.new($scope);
        
        msPlayer.loadSetlist(fileSystem, $scope, $q, auth.token, $stateParams.id);
        
    }

    $scope.suspend = function(){

        msPlayer.suspend($scope);

    };

    $scope.changePosition = function(){

        msPlayer.changePosition($scope);

    };

    $scope.play = function(){

        if ($scope.msPlayer.status == 3){ //IS_SUSPENDED_STATUS

            msPlayer.resume($scope);

        } else {
            
            msPlayer.play($scope);

        }

    };

    $scope.loadMusic = function(musicId){

        msPlayer.new($scope);

        msPlayer.setCurrentMusic($q, $scope, auth.token, musicId);


    };

    $scope.$watch('$viewContentLoaded', function() {
        
        $scope.$parent.showSearch = false;

        $scope.token = auth.token;

    });



});

module.controller('SetlistDetailController', function($scope, 
                                                      $q,
                                                      $ionicNavBarDelegate,
                                                      $rootScope,
                                                      $stateParams,
                                                      $ionicModal,
                                                      auth, 
                                                      musicService,
                                                      msSessionConfig, 
                                                      setlistService) {
    
    

    $ionicModal.fromTemplateUrl('templates/addMusicToSetlist.html', {
        scope: $scope,
        controller: 'SetlistDetailController',
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.changeMode = function(music) {
        
        var promises = [];
        
        promises.push(setlistService.updateMode($scope, auth.token, $scope.setlistId, music.musicId, music.inicio));
        
        $q.all(promises).then(
            function(response) {
            }
        );

    };

    $scope.moveItem = function(item, fromIndex, toIndex) {
        //Move the item in the array

        var newSetlistMusics = [];
        var promises = [];
        
        $scope.setlistMusics.splice(fromIndex, 1);
        $scope.setlistMusics.splice(toIndex, 0, item);

       $scope.setlistMusics.forEach(function (entry){

            newSetlistMusics.push(entry.musicId);

        });

        promises.push(setlistService.updateSetlist($scope, auth.token, $scope.setlistId, newSetlistMusics));
        
        $q.all(promises).then(
            function(response) { 
                
            }, 
            function(x) { 
                $scope.debugTxt = x; 
            }
        ).finally(function() {
        });

    };

    $scope.alterChangePositionStatus = function(){
        $scope.showChangeItemPosition = ($scope.showChangeItemPosition == false);
    };

    $scope.changeSetList = function() {
        
        var newSetlistMusics = [];
        var orderedSetlistMusics = [];
        var promises = [];

        $scope.setlistMusics.forEach(function (entry){

            if (wasSelected(entry.musicId)){
                newSetlistMusics.push(entry.musicId);
            }


        });

       $scope.musics.forEach(function (entry){

            if (entry.added == true){
                if (!isInPlaylist(entry.musicId)){
                    newSetlistMusics.push(entry.musicId);
                }   
            }

        });

        promises.push(setlistService.updateSetlist($scope, auth.token, $scope.setlistId, newSetlistMusics));
        
        $scope.modal.hide();
        
        $q.all(promises).then(
            function(response) { 
                
                $scope.setlistMusics = response[0].musics; 
                
            }, 
            function(x) { 
                
                $scope.debugTxt = x; 
            }
        ).finally(function() {
            //$scope.debugTxt = 'Done waiting';
        });
    
        
        
        
        
    };

var wasSelected = function(musicId){

    var returnValue;

    returnValue = false;

    $scope.musics.forEach(function (entry){

        if(entry.musicId == musicId){

            if (entry.added == true){
                returnValue = true;
            }
            
        }

    });

    return returnValue;

}

var isInPlaylist = function(musicId){

    var returnValue;

    returnValue = false;

    $scope.setlistMusics.forEach(function (entry){

        if(entry.musicId == musicId){
            returnValue = true;
        }

    });

    return returnValue;

}

    $scope.$watch('$viewContentLoaded', function() {
        
        $scope.$parent.showSearch = false;
        $scope.showChangeItemPosition = false;

        var promises = [];
        
        $scope.token = auth.token;
        $scope.setlistId = $stateParams.id;
        
        $ionicNavBarDelegate.showBar(false);

        promises.push(musicService.getMyMusics($scope, auth.token));
        promises.push(setlistService.getSetlistDetail($scope, auth.token, $stateParams.id));
        
        $q.all(promises).then(
            function(response) { 
                //$scope.debugTxt = response[1];
                $scope.musics = response[0].musicas; 
                $scope.setlistMusics = response[1].musics; 
                
                $scope.setlistName = response[1].title;
                $scope.setlistTime = response[1].totalTime;
                $scope.setlistId = response[1].id;
                
                for (var idx = 0; idx < $scope.musics.length; idx++){
                    
                    //addedIds[idx] = {"checked": false};

                    $scope.musics[idx].added = false;
                    
                    for (var idy = 0; idy < $scope.setlistMusics.length; idy++){
                        
                        if ($scope.musics[idx].musicId == $scope.setlistMusics[idy].musicId){
                            //addedIds[idx] = {"checked": true};
                            $scope.musics[idx].added = true;
                        }
                        
                    }
                    
                }
                
                //$scope.addedIds = addedIds;
                
            }, 
            function() { 
                
                $scope.debugTxt = 'Failed'; 
            }
        ).finally(function() {
            //$scope.debugTxt = 'Done waiting';
        });
        
        
    });
    
});
