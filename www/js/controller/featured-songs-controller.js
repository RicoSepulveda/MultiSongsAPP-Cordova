module.controller('FeaturedSongController', function($scope,
                                                     $rootScope,
                                                     $stateParams,
                                                     $q,
                                                     auth,
                                                     featuredMusicService,
                                                     miniPlayer) {

    $scope.$watch('$viewContentLoaded', function() {

        var promises = [];

        $scope.token = auth.token;

        promises.push(featuredMusicService.getFeaturedMusicSet(auth.token, $stateParams.id));
        
        $q.all(promises).then(
            function(response) { 
                $scope.featuredSong = response[0].bean;
            },
            function() { 
                $scope.debugTxt = 'Failed'; 
            }
        ).finally(function() {
        });

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
