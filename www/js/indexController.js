
module.controller('MainController', function($scope,
                                             $ionicNavBarDelegate,
                                             $location) {
    
    $scope.openSearch = function ( path ) {
      $location.path('/search/');
    };

    $scope.go = function ( path ) {
        $scope.showSearch = false;
        $scope.search = {keyword: ""};
        /*
        if (path == "/wishlist"){
            $ionicNavBarDelegate.setTitle("Lista de Desejos");
        }else{
            $ionicNavBarDelegate.setTitle("Merda...");
        }
        */
        
        $location.path(path);
    };

    $scope.$watch('$viewContentLoaded', function() {
        
        //$ionicNavBarDelegate.setTitle("Loading...");
        
        //$location.path("/");
        
    });
    
    
});

module.controller('IndexController', function($scope, 
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
                                              auth,
                                              msSessionConfig) {

    
    //$ionicNavBarDelegate.showBar(true);

    $scope.openMusicModal = function(music){

        $scope.modal.show();

    }
    
    $scope.changeFavorite = function(music){
        
        var promises = [];
        
        $ionicListDelegate.closeOptionButtons();

        promises.push(musicService.changeFavorite($scope, auth.token, music.musicId));

        $q.all(promises).then(
            function(response) { 
            }
        );
        
    };

    $scope.$watch("$viewContentLoaded", function() {

        $ionicModal.fromTemplateUrl('templates/level.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
            
        var key = 'rsepulveda';
        var password = '567825';
        
        loginService.login($scope, key, password, function(response){
            
            var promises = [];

            auth.token = response.token;

            $scope.token = auth.token;

            promises.push(configService.getConfig($scope, response.token, msSessionConfig));
            promises.push(featuredMusicService.getFeaturedMusics($scope, response.token));
            promises.push(musicService.getNewSongs($scope, response.token));
            promises.push(musicService.getTopMusics($scope, response.token, 5));
            promises.push(artistService.getTopArtists($scope, response.token, 5));
            //promises.push(wishlistService.getWishlists($scope, response.token));
            
            $q.all(promises).then(
                function(response) { 
                    

                    msSessionConfig.storeBarTitle = response[0].storeBarTitle;
                    msSessionConfig.myWishlistBarTitle = response[0].myWishlistSongsBarTitle;
                    msSessionConfig.mySongsBarTitle = response[0].mySongsBarTitle;
                    msSessionConfig.mySetListsBarTitle = response[0].mySetListsBarTitle;

                    msSessionConfig.newSongsButtom = response[0].newSongsButtom;
                    msSessionConfig.topSongsButtom = response[0].topSongsButtom;
                    msSessionConfig.topArtistsButtom = response[0].topArtistsButtom;

                    msSessionConfig.storeMenu = response[0].storeMenu;
                    msSessionConfig.wishlistMenu = response[0].wishlistMenu;
                    msSessionConfig.musicMenu = response[0].musicMenu;
                    msSessionConfig.setlistMenu = response[0].setlistMenu;
                    msSessionConfig.configMenu = response[0].configMenu;

                    //$scope.storeBarTitle = msSessionConfig.storeBarTitle;
                    $scope.myWishlistBarTitle = msSessionConfig.myWishlistBarTitle;
                    $scope.mySongsBarTitle = msSessionConfig.mySongsBarTitle;
                    $scope.mySetlistsTitle = msSessionConfig.mySetlistsTitle;

                    $scope.newSongsButtom = msSessionConfig.newSongsButtom;
                    $scope.topSongsButtom = msSessionConfig.topSongsButtom;
                    $scope.topArtistsButtom = msSessionConfig.topArtistsButtom;

                    $scope.storeMenu = msSessionConfig.storeMenu;
                    $scope.wishlistMenu = msSessionConfig.wishlistMenu;
                    $scope.musicMenu = msSessionConfig.musicMenu;
                    $scope.setlistMenu = msSessionConfig.setlistMenu;
                    $scope.configMenu = msSessionConfig.configMenu;
                    
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
                    $ionicNavBarDelegate.setTitle(msSessionConfig.storeBarTitle);
                    
                    $scope.wishlist = response[5];
                    
                    for (var idx = 0; idx < $scope.wishlist.length; idx++){
                        
                        $scope.topMusics[idy].favorite = false;
                        
                        for (var idy = 0; idy < $scope.topMusics.length; idy++){
                            
                            if ($scope.topMusics[idy].id == $scope.wishlist[idx].id){
                                $scope.topMusics[idy].favorite = true;
                            }
                            
                        }
                        
                    }
                    
                    
                },
                function() { 
                    $scope.teste = 'Failed'; 
                }
            ).finally(function() {
            });
                
                
        });
        
    });
    
    

});

module.controller('SetlistController', function($scope, 
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
                $scope.modal.hide();
                $location.path("/setlistDetail/" + response[0].id);
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
        
        promises.push(setlistService.getSetlists($scope, auth.token));
        
        $q.all(promises).then(
            function(response) { 
                $scope.setLists = response[0].setLists;
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
    
    $scope.$watch('$viewContentLoaded', function() {

        $ionicNavBarDelegate.showBar(true);
        $ionicNavBarDelegate.setTitle(msSessionConfig.mySetListsBarTitle);
        
        $scope.$parent.showSearch = false;
        $scope.token = auth.token;
        
        $scope.loadSetlists();
    
        
    });

});

module.controller('MyMusicsController', function($scope, 
                                                 $q,
                                                 $ionicNavBarDelegate,
                                                 $rootScope,
                                                 musicService,
                                                 auth,
                                                 msSessionConfig) {

    $scope.$watch('$viewContentLoaded', function() {

        $ionicNavBarDelegate.showBar(true);
        $ionicNavBarDelegate.setTitle(msSessionConfig.mySongsBarTitle);
        
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
        
        
    });

});

module.controller('TrackController', function($scope, 
                                              $q,
                                              $ionicNavBarDelegate,
                                              $rootScope,
                                              $stateParams,
                                              $interval, 
                                              musicService,
                                              auth,
                                              msSessionConfig,
                                              msPlayer) {

    var intervalToMusicPosition;

    $scope.changeSolo = function(track){

        if (track.solo == true){
            track.solo = false;
            msPlayer.unactivateSolo($scope, track);
        } else {
            track.solo = true;
            msPlayer.activateSolo($scope, track);
        }

    };

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
        //$interval.cancel(intervalToMusicPosition);

        $scope.isPlaying = false;

    };

    $scope.changePosition = function(){

        //$interval.cancel(intervalToMusicPosition);

        msPlayer.changePosition($scope);

        //$scope.debugTxt2 = "posicao alterada para: " + ((240 / 100) * $scope.timer.value);

        //intervalToMusicPosition = $interval(function(){$scope.timer.value++;}, 240 * 1000 / 100, 100 - $scope.timer.value);

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

        //msPlayer.new();
    
        var promises = [];
        
        $scope.token = auth.token;

        $scope.isPlaying = false;
        
        //$ionicNavBarDelegate.setTitle(msSessionConfig.mySongsBarTitle);
        
        promises.push(musicService.getMusicDetails($scope, auth.token, $stateParams.musicId));
        
        $q.all(promises).then(
            function(response) { 
                //$scope.debugTxt2 = "response: " + response;
                msPlayer.loadTracks($scope, $q, response[0], auth.token);
            },
            function() { 
                $scope.debugTxt = 'Failed'; 
            }
        ).finally(function() {
        });
        
        
    });

});

module.controller('WishlistController', function($scope, 
                                                 $q,
                                                 $ionicNavBarDelegate,
                                                 $ionicListDelegate,
                                                 $rootScope,
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

    
    $scope.$watch('$viewContentLoaded', function() {
    
        $scope.$parent.showSearch = false;

        $ionicNavBarDelegate.showBar(true);
        $ionicNavBarDelegate.setTitle(msSessionConfig.myWishlistBarTitle);
        
        var promises = [];
        
        $scope.token = auth.token;

        promises.push(wishlistService.getWishlists($scope, auth.token));
        
        //$ionicNavBarDelegate.setTitle(msSessionConfig.myWishlistBarTitle);
        
        $q.all(promises).then(
            function(response) { 
                    $scope.wishList = response[0].musicas;
            },
            function() { 
                $scope.debugTxt = 'Failed'; 
            }
        ).finally(function() {
        });

        
    });

});

module.controller('SearchController', function($scope, 
                                               $q,
                                               $stateParams,
                                               $ionicNavBarDelegate,
                                               $location,
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
                
            },
            function() { 
                $scope.test = 'Failed'; 
            }
        );

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
            promises.push(searchService.searchByKeyword($scope, auth.token, 10, $stateParams.keyword));
            
        }
        
        $q.all(promises).then(
            function(response) {
                if ($stateParams.type == "3"){
                    $scope.artists = response[0].artistas;
                }else if ($stateParams.type == "4"){
                    $scope.musics = response[0].musicsByArtistName;
                }else{
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
    /*
    $scope.toggleChange = function(music) {
        
        //$scope.addedIds[idx].checked = $scope.addedIds[idx].checked == false;

        $scope.debugTxt = "Alterando music " + music.musicName + " eh " + music.added;

        music.added = (music.added == false);
        
    };
    */
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


    /*
    $scope.remover = function(music) {
        
        for (var idx = 0; idx < $scope.addedIds.length; idx++){
            if ($scope.musics[idx].musicId == music.musicId){
                
                $scope.addedIds[idx].checked = false;
                //$scope.debugTxt = "musicId = " + music.musicId + " idx = " + idx + " checked = " + $scope.addedIds[idx].checked;
            }
        }
        

        music.added = false;
        
        $scope.changeSetList();
        
    };
    */

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

/*
    var getPositionOnSetlist = function(musicId){

        var finalIdx;

        finalIdx = -1;

        $scope.setlistMusics.forEach(function (entry){

            if(entry.musicId != musicId){
                finalIdx++;
            }

        });

        return finalIdx;

    };
*/
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
