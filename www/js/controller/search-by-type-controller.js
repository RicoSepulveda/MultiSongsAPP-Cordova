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

