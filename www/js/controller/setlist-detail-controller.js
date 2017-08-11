module.controller('SetlistDetailController', function($scope, 
                                                      $q,
                                                      $ionicNavBarDelegate,
                                                      $rootScope,
                                                      $stateParams,
                                                      $ionicModal,
                                                      $location, 
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

    $scope.changeMode = function(music) {
        
        var promises = [];
        
        promises.push(setlistService.updateMode(auth.token, $scope.setlistId, music.musicId, music.inicio));
        
        $q.all(promises).then(
            function(response) {
            }
        );

    };

    $scope.go = function ( path ) {

        var description;

        description = $rootScope.i18.general.bloquedResourceMessage; 

        $scope.modal.hide();

        if (path != '/wishlist' && path != '/setlist' && path != '/musics'){
            $location.path(path);
        } else {
            loginService.validateAuthorization(description, function(path){$location.path(path)}, path);
        }

    }


    $scope.moveItem = function(item, fromIndex, toIndex) {
        //Move the item in the array

        var newSetlistMusics = [];
        var promises = [];
        
        $scope.setlistMusics.splice(fromIndex, 1);
        $scope.setlistMusics.splice(toIndex, 0, item);

       $scope.setlistMusics.forEach(function (entry){

            newSetlistMusics.push(entry.musicId);

        });

        promises.push(setlistService.updateSetlist(auth.token, $scope.setlistId, newSetlistMusics));
        
        $q.all(promises).then(
            function(response) { 
                
            }, 
            function(x) { 
                $scope.debugTxt = x; 
            }
        ).finally(function() {
        });

    };

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

        promises.push(setlistService.updateSetlist(auth.token, $scope.setlistId, newSetlistMusics));
        
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



    $scope.$watch('$viewContentLoaded', function() {
        
        $scope.$parent.showSearch = false;
        $scope.showChangeItemPosition = false;

        var promises = [];
        
        $scope.token = auth.token;
        $scope.setlistId = $stateParams.id;
        
        $ionicNavBarDelegate.showBar(false);

        promises.push(musicService.getMyMusics(auth.token));
        promises.push(setlistService.getSetlistDetail(auth.token, $stateParams.id));
        
        $q.all(promises).then(
 
            function(response) { 


                $scope.musics = response[0].musicas; 
                $scope.setlistMusics = response[1].musics; 
                
                $scope.setlistName = response[1].title;
                $scope.setlistTime = response[1].totalTime;
                $scope.setlistId = response[1].id;
                $scope.setlistMusics = response[1].musics;
                
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
