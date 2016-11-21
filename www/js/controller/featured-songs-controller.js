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
