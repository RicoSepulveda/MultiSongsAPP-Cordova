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
