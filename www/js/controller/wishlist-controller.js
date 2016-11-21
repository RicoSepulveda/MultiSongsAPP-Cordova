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
