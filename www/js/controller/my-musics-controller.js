module.controller('MyMusicsController', function($scope, 
                                                 $q,
                                                 $ionicNavBarDelegate,
                                                 $rootScope,
                                                 $ionicModal,
                                                 $ionicPopup,
                                                 musicService,
                                                 auth,
                                                 msSessionConfig,
                                                 miniPlayer) {

    $scope.SONG_TYPE_UNDEFINED = 0;
    $scope.SONG_TYPE_DOWNLOADED = 1;
    $scope.SONG_TYPE_REMOVED = 2;

    var loadDownloadedSongs = function(){

        $scope.songType = $scope.SONG_TYPE_UNDEFINED;

        $ionicNavBarDelegate.showBar(true);
        $ionicNavBarDelegate.title(msSessionConfig.mySongsBarTitle);
        
        $scope.$parent.showSearch = false;
    
        var promises = [];
        
        $scope.token = auth.token;
        
        //promises.push(musicService.getRecentlyAdded($scope, auth.token));
        promises.push(musicService.getMyMusics(auth.token));

        $scope.downloadedClass = "button small-button-category-selected";
        $scope.wishlistClass = "button small-button-category";
        
        $q.all(promises).then(
            function(response) { 

                $scope.musics = response[0].musicas;
                $scope.songType = $scope.SONG_TYPE_DOWNLOADED;

            },
            function() { 
                $scope.debugTxt = 'Failed'; 
            }
        ).finally(function() {
        });

    }

    var loadRemovedSongs = function(){

        $scope.songType = $scope.SONG_TYPE_UNDEFINED;

        $ionicNavBarDelegate.showBar(true);
        $ionicNavBarDelegate.title(msSessionConfig.mySongsBarTitle);
        
        $scope.$parent.showSearch = false;
    
        var promises = [];
        
        $scope.token = auth.token;
        
        //promises.push(musicService.getRecentlyAdded($scope, auth.token));
        promises.push(musicService.getMyRemovedSongs(auth.token));
        
        $scope.downloadedClass = "button small-button-category";
        $scope.wishlistClass = "button small-button-category-selected";

        $q.all(promises).then(
            function(response) { 

                $scope.songType = $scope.SONG_TYPE_REMOVED;
                $scope.musics = response[0].musicas;

            },
            function() { 
                $scope.debugTxt = 'Failed'; 
            }
        ).finally(function() {
        });

    }

    $scope.removeSong = function(music){

        var promises = [];
        var confirmPopup;
        var functionToBeCalled;
        
        $scope.token = auth.token;
        
        if ($scope.songType == $scope.SONG_TYPE_DOWNLOADED){

            functionToBeCalled = loadDownloadedSongs;

            confirmPopup = $ionicPopup.confirm({
                title: "Remoção de música do celular",
                template: "A música será removida do seu celular, mas você poderá baixá-la novamente quando quiser. Deseja continuar?"
            });

        } else {

            functionToBeCalled = loadRemovedSongs;

            confirmPopup = $ionicPopup.confirm({
                title: "Remoção de música favorita",
                template: "Deseja remover a música da sua lista de músicas favoritas?"
            });

        }

       confirmPopup.then(function(res) {

         if(res) {

            promises.push(musicService.removeSongFromUser($scope.token, music.musicId));

            $q.all(promises).then(
                function(response) { 
                    functionToBeCalled();
                },
                function() { 
                }
            ).finally(function() {
            });

         } else {
           
         }

       });


    }

    $scope.loadDownloadedSongs = function(){loadDownloadedSongs();}
    $scope.loadRemovedSongs = function(){loadRemovedSongs();}

    $scope.$watch('$viewContentLoaded', function() {

        loadDownloadedSongs();

        $scope.miniPlayer = miniPlayer;

        miniPlayer.loadPlayer();

    });

    $scope.play = function(musicId){
        console.log("miniPlayer.PLAYER_TYPE_SINGLETRACK_LOCAL: " + miniPlayer.PLAYER_TYPE_SINGLETRACK_LOCAL);
        miniPlayer.play(musicId, miniPlayer.PLAYER_TYPE_SINGLETRACK_LOCAL); // Carrega musica com single player e leitura de musica local
    }

    $scope.suspend = function(){
        miniPlayer.suspend();
    }

    $scope.resume = function(musicDetail){
        miniPlayer.resume(musicDetail);
    }

    $scope.changePlayerExpantion = function(){
        miniPlayer.changePlayerExpantion();
    }

});
