module.controller('SetlistPlayerController', function($scope, 
                                                      $q,
                                                      $ionicNavBarDelegate,
                                                      $rootScope,
                                                      $stateParams,
                                                      auth, 
                                                      msSessionConfig, 
                                                      msPlayer) {


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

        msPlayer.gotoMusicInSetlist(musicId);

    };

    $scope.$watch('$viewContentLoaded', function() {


        $scope.msPlayer = msPlayer;

        $ionicNavBarDelegate.showBar(false);
        $scope.token = auth.token;

        isAnApp = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

        if ( isAnApp ) {
            
            document.addEventListener("deviceready", function(){
                msPlayer.setFileSystem(cordova.file.dataDirectory);
                _loadSetlist();
            }, false);

        }else{
          _loadSetlist();
        }


    });

    var _loadSetlist = function(){

            if (!msPlayer.getPlayer().status.isPlaying || msPlayer.getPlayer().status.isPlaying && msPlayer.getPlayer().setlist.id != $stateParams.id){
                msPlayer.unloadSetlist();
                msPlayer.loadSetlist($stateParams.id);
            }

    }



});
