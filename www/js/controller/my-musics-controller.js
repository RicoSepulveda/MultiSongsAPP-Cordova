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
