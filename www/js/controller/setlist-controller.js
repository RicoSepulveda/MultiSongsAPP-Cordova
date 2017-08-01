module.controller('SetlistController', function($scope, 
                                                $rootScope,
                                                $q,
                                                $ionicNavBarDelegate,
                                                $ionicListDelegate,
                                                $ionicPopup,
                                                $ionicModal,
                                                setlistService,
                                                auth,
                                                msSessionConfig,
                                                $location) {

    $ionicModal.fromTemplateUrl('templates/changeSetlists.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    
    $scope.openModal = function(setlist){
        
        $ionicListDelegate.closeOptionButtons();
        
        if (setlist === null){
            $scope.setlist = {name: "", id: -1, type: "OTHERS_SETLIST_GROUP"};
        }else{
            $scope.setlist = {name: setlist.title, id: setlist.id, type: setlist.group};
        }
        
        $scope.modal.show();
    };
        
    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    
    $scope.persistSetlist = function(){
        if ($scope.setlist.id > -1){
            $scope.updateSetlistAttributes();
        }else{
            $scope.createSetlist();
        }
        
    };
    
    $scope.createSetlist = function(){
        
        var promises = [];
        
        if ($scope.setlist.name == ''){

            var alertPopup = $ionicPopup.alert({
                title: "Ops!",
                template: "Você precisa preencher todos os campos antes de criar sua SetList."
            });

            alertPopup.then(function(res) {
            });

        } else {

            promises.push(setlistService.createSetlist(auth.token, $scope.setlist.name, $scope.setlist.type));
            
            $q.all(promises).then(
                function(response) { 

                    var alertPopup = $ionicPopup.alert({
                        title: $rootScope.i18.setlist.createdMessageTitle,
                        template: $rootScope.i18.setlist.createdMessage
                    });

                    alertPopup.then(function(res) {
                        $scope.modal.hide();
                        $location.path("/setlistDetail/" + response[0].id);
                    });

                },
                function() { 
                    $scope.debugTxt = 'Failed'; 
                }

            ).finally(function() {
            });

        }

    };
    
    $scope.removeSetlist = function(setlistId){
        
        var promises = [];
        
        promises.push(setlistService.removeSetlist(auth.token, setlistId));
        
        $q.all(promises).then(
            function(response) {
                $scope.loadSetlists();
            },
            function(response) { 
                $scope.debugTxt = response; 
            }
        ).finally(function() {
            
        });
        
    };

    $scope.updateSetlistAttributes = function(){
        
        var promises = [];
        
        promises.push(setlistService.updateSetlistAttributes(auth.token, $scope.setlist.id, $scope.setlist.name, $scope.setlist.type));
        
        $q.all(promises).then(
            function(response) { 
                $scope.modal.hide();
                $scope.loadSetlists();
            },
            function(response) { 
                $scope.debugTxt = response; 
            }
        ).finally(function() {
        });
        
    };
    
    $scope.loadSetlists = function(){
        
        var promises = [];
        var setlistGroups = {};
        
        promises.push(setlistService.getSetlists(auth.token));
        
        $q.all(promises).then(
            function(response) { 

                response[0].setLists.forEach(function (entry){

                    if (!setlistGroups.hasOwnProperty(entry.group)){
                        setlistGroups[entry.group] = new Array();
                    }

                    setlistGroups[entry.group].push(entry);

                });

                $scope.setlistGroups = setlistGroups;

                $scope.setlistGroupsSize = response[0].setLists.length;

            },
            function(response) { 
                $scope.debugTxt = response; 
            }
        ).finally(function() {
        });

        
    };
    
    $scope.showConfirm = function(setlistId) {
        
        $ionicListDelegate.closeOptionButtons();
        
       var confirmPopup = $ionicPopup.confirm({
         title: $rootScope.i18.setlist.dropMessageTitle,
         template: $rootScope.i18.setlist.dropMessage
       });

       confirmPopup.then(function(res) {
         if(res) {
           $scope.removeSetlist(setlistId);
         } else {
           
         }
       });
     };

     var onLoad = function(){

        $ionicNavBarDelegate.showBar(true);
        $ionicNavBarDelegate.title(msSessionConfig.mySetListsBarTitle);
        
        $scope.$parent.showSearch = false;
        $scope.token = auth.token;
        
        $scope.loadSetlists();

     }

    $scope.$watch('$viewContentLoaded', function() {

        onLoad();
        
    });

});
