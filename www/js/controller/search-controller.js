module.controller('SearchController', function($scope, 
                                               $q,
                                               $stateParams,
                                               $ionicNavBarDelegate,
                                               $location,
                                               $interval,
                                               $ionicModal,
                                               $ionicPopup,
                                               auth,
                                               searchService,
                                               musicService,
                                               msSessionConfig,
                                               miniPlayer) {
    
    $ionicModal.fromTemplateUrl('templates/newPlaybackRequest.html', {
        scope: $scope,
        controller: 'SearchController',
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.openNewRequest = function(){


        if (auth.type == 1){ // Nao logado...
            $rootScope.description = $rootScope.i18.general.loginDescriptionMessage;
            $rootScope.originalDescription = $rootScope.description;

            $rootScope.callback = {func : function(args){
                $scope.userType = auth.type;
            }, args : "args"};

            $ionicModal.fromTemplateUrl('templates/login.html', {
                scope: $rootScope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.loginModal = modal;
                $rootScope.loginModal.show();
            });
        } else {
            $scope.modal.show();
        }

    }

    $scope.submitRequest = function(){

        var promises = [];
    
        if ($scope.newPlaybackRequest.musicName == '' || $scope.newPlaybackRequest.artistName == ''){

            var alertPopup = $ionicPopup.alert({
                title: "Ops!",
                template: "Você precisa preencher todos os campos antes de enviar seu pedido."
            });

            alertPopup.then(function(res) {
            });


        }else{

            promises.push(musicService.newPlayback(auth.token, $scope.newPlaybackRequest.musicName, $scope.newPlaybackRequest.artistName));

            $q.all(promises).then(

                function(response) {

                        var alertPopup = $ionicPopup.alert({
                            title: "Pedido registrado",
                            template: "Avisaremos você quando seu Playback estiver disponível na MultiSongs."
                        });

                        alertPopup.then(function(res) {
                            $scope.modal.hide();
                        });

                },
                function() { 
                        var alertPopup = $ionicPopup.alert({
                            title: "Ops!",
                            template: "Não conseguimos registrar seu pedido. Tente novamente em alguns minutos."
                        });

                        alertPopup.then(function(res) {
                            $scope.modal.hide();
                        });
                }
            );


        }

    };

    $scope.closeSearchWindow = function(){
        
        $ionicNavBarDelegate.showBar(true);
        //
        $location.path('/');
    };
    
    $scope.vote = function(idPedido){
        
        var promises = [];
    
        $scope.token = auth.token;
        
        promises.push(musicService.vote(auth.token, idPedido));
        
        $q.all(promises).then(

            function(response) {

                $scope.desiresByName.forEach(function (entry){

                  if (entry.idPedido == response[0].bean.idPedido){
                    entry.votes = response[0].bean.votes;
                    entry.voted = response[0].bean.voted;
                  }

                });

            },
            function() { 
                $scope.test = 'Failed'; 
            }
        );

    };

    $scope.refreshData = function(){

        if ($scope.refreshDataInterval  && $scope.refreshDataInterval != null){
            $interval.cancel($scope.refreshDataInterval);
        }

        $scope.refreshDataInterval = $interval(function(){

            var promises = [];
        
            $scope.token = auth.token;
            $scope.searchDone = true;
            
            promises.push(searchService.searchByKeyword(auth.token, 10, $scope.search.keyword));
            
            $q.all(promises).then(
                function(response) {
                    $scope.byNameResult = response[0].musicsByName;
                    $scope.byArtistResult = response[0].musicsByArtistName;
                    $scope.byStyleResult = response[0].musicsByStyleName;
                    $scope.byStudioResult = response[0].musicsByStudioName;
                    $scope.byAlbumResult = response[0].musicsByAlbumName;
                    $scope.desiresByName = response[0].desires;
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

        $scope.miniPlayer = miniPlayer;

        $scope.searchDone = false;

        //miniPlayer.loadPlayer();

        $scope.newPlaybackRequest = {musicName : "", artistName : ""};

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
