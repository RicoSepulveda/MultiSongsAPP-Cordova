module.controller('SearchByTypeController', function($scope, 
                                                     $q,
                                                     $ionicListDelegate,
                                                     $location,
                                                     $stateParams,
                                                     $ionicNavBarDelegate,
                                                     $rootScope,
                                                     auth,
                                                     musicService,
                                                     artistService,
                                                     searchService,
                                                     msSessionConfig,
                                                     miniPlayer) {
    
    
    $scope.changeFavorite = function(music){
        
        var promises = [];
        
        $ionicListDelegate.closeOptionButtons();

        promises.push(musicService.changeFavorite(auth.token, music.musicId));

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
            
            $rootScope.buffer.newSongs.valid = false; // Invalida cache para realizar a busca novamente 
                                                      // com 20 musicas e nao somente 6 como acontece na home

            promises.push(musicService.getNewSongs(auth.token, 20));
            
        } else if ($stateParams.type == "2"){ // Top Musics

            $rootScope.buffer.topMusics.valid = false;
            
            promises.push(musicService.getTopMusics(auth.token, 20));
            
        } else if ($stateParams.type == "3"){ // Top Artists
            //$scope.teste = "chamou....";
            promises.push(artistService.getTopArtists(auth.token, 10));
            
        } else if ($stateParams.type == "4"){ // Top Artists
            //$scope.teste = "chamou....";
            promises.push(searchService.searchByType(auth.token, 20, $stateParams.keyword, 1));
            
        } else if ($stateParams.type == "5"){ // Top Artists
            //$scope.teste = "chamou....";
            promises.push(searchService.searchByType(auth.token, 10, $stateParams.keyword, 3));
            
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

        $scope.miniPlayer = miniPlayer;

        miniPlayer.loadPlayer();

        
    });

    $scope.play = function(musicId){
        miniPlayer.play(musicId, miniPlayer.PLAYER_TYPE_SINGLETRACK);
    }

    $scope.suspend = function(){
        miniPlayer.suspend();
    }

    $scope.resume = function(musicDetail){
        miniPlayer.resume(musicDetail);
    }

    $scope.verifyIfLoginIsNeededBeforeDownload = function(){
        miniPlayer.verifyIfLoginIsNeededBeforeDownload();
    }

    $scope.changePlayerExpantion = function(){
        miniPlayer.changePlayerExpantion();
    }


});

