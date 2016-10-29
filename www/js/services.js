

module.factory('featuredMusicService', function($http, $interval, $q){
     
    return {
        
        getFeaturedMusicSets: function($rootScope, $scope, token) { 
              
            var deferred = $q.defer();
            
            if ($rootScope.buffer.featuredMusicSets.valid){
                $interval(function(){deferred.resolve($rootScope.buffer.featuredMusicSets.data);}, 50, 1);
            }else{

                var request = $http({
                    method: "post",
                    url: "http://www.multisongs.audio/MultiSongs/api/featured/list",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                    },
                    dataType:"json",
                    data: {token : token}
                });


                request.success(
                    function( response ) {

                        $rootScope.buffer.featuredMusicSets.data = response;
                        $rootScope.buffer.featuredMusicSets.valid = true;

                        deferred.resolve(response);
                        
                    }
                );

                request.error(
                        function( response ) { 
                            deferred.reject(response);
                        }
                );

            }

            return deferred.promise;
            
        },

        getFeaturedMusicSet: function($rootScope, $scope, $rootScope, token, id) { 
              
            var deferred = $q.defer();

            if ($rootScope.buffer.featuredMusicSet && $rootScope.buffer.featuredMusicSet[id] && $rootScope.buffer.featuredMusicSet[id].valid){
                $interval(function(){deferred.resolve($rootScope.buffer.featuredMusicSet[id].data);}, 50, 1);
            } else {

                var request = $http({
                    method: "post",
                    url: "http://www.multisongs.audio/MultiSongs/api/featured/get",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                    },
                    dataType:"json",
                    data: {token : token, id : id}
                });


                request.success(
                    function( response ) {

                        $rootScope.buffer.featuredMusicSet[id].data = response;
                        $rootScope.buffer.featuredMusicSet[id].valid = true;

                        deferred.resolve(response);
                        

                    }
                );

                request.error(
                        function( response ) { 
                            deferred.reject(response);
                        }
                );

            }
            
            return deferred.promise;
            
        } 

    }
      
     
 });

module.factory('configService', function($http, $interval, $q){
     
    return {
        
        getConfig: function($rootScope, $scope, token, sessionConfig) { 
              
            var deferred = $q.defer();

            if ($rootScope.buffer.config.valid){

                $interval(function(){deferred.resolve($rootScope.buffer.config.data);}, 50, 1);

            } else {
                
                var request = $http({
                    method: "post",
                    url: "http://www.multisongs.audio/MultiSongs/api/general/config",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                    },
                    dataType:"json",
                    data: {token : token}
                });

                request.success(
                    
                    function( response ) {

                        $rootScope.buffer.config.data = response;
                        $rootScope.buffer.config.valid = true;

                        deferred.resolve(response);

                    }
                );

                request.error(
                        function( response ) { 
                            deferred.reject(response);
                            $scope.destaqueStr = response; 
                        }
                );

            }   

            return deferred.promise;
            
        } 
    }
      
     
 });

module.factory('loginService', function($http, $rootScope, $ionicModal, auth){
    
    return {

        createAccount: function(token, key, password, name, idiom, country, callbackFunction) { 
            
             var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/auth/create",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
               data: {token : token, key : key, password: password, name : name, idiom : idiom, country : country, type : 2}
            });


            request.success(
                function( response ) {

                    auth.token = response.token;
                    auth.userType = response.userType;

                    callbackFunction(response);

                }
            );

            request.error(
                function( response , textStatus, errorThrown) { 
                    //$scope.debugTxt = response + " - " + errorThrown + " - " + textStatus; 
                    callbackFunction(response);
                }
            );

        },
        
        login: function($scope, key, password, callbackFunction) { 
            
             var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/auth/login",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
               data: {key : key, password: password}
            });


            request.success(
                function( response ) {

                    this.token = response.token;

                    callbackFunction(response);
                }
            );

            request.error(
                function( response , textStatus, errorThrown) { 
                    $scope.debugTxt = response + " - " + errorThrown + " - " + textStatus; 
                }
            );

        },

        validateAuthorization: function(description, callback, args){

            if (auth.type && auth.type != 1){

                callback(args);

            } else {

                $rootScope.description = description;

                $rootScope.originalDescription = $rootScope.description;
                $rootScope.descriptionClass = "ms-font-light-gray";

                $rootScope.callback = {func : callback, args : args};

                $ionicModal.fromTemplateUrl('templates/login.html', {
                    scope: $rootScope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    $rootScope.loginModal = modal;
                    $rootScope.loginModal.show();
                });

            }

        }

    }
     
});


module.factory('artistService', function($http, $interval, $q){
     
    return {
        
        getTopArtists: function($rootScope, $scope, token, limit) { 
            
            var deferred = $q.defer();

            if ($rootScope.buffer.topArtists.valid){
                $interval(function(){deferred.resolve($rootScope.buffer.topArtists.data);}, 50, 1);
            }else{

                var request = $http({
                    method: "post",
                    url: "http://www.multisongs.audio/MultiSongs/api/artist/top",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                   },
                   dataType:"json",

                    data: {token : token, limit : limit}
                });


                request.success(

                    function( response ) {

                        $rootScope.buffer.topArtists.data = response;
                        $rootScope.buffer.topArtists.valid = true;
                        
                        deferred.resolve(response);

                    }
                );

                request.error(
                    
                    function( response ) { 
                        
                        deferred.reject(response);
                        
                        $scope.destaqueStr = response; 
                        
                    }
                    
                );

            }
            
            return deferred.promise;
            
        } 
    }
      
     
});

module.factory('searchService', function($http, $q){
     
    return {
        
        searchByKeyword: function($scope, token, limit, keyword) { 
            
            var deferred = $q.defer();
            
            var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/music/search/keyword",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",

                data: {token : token, limit : limit, keyword: keyword}
            });
            
            request.success(

                function( response ) {

                    deferred.resolve(response);

                }
            );

            request.error(

                function( response ) { 

                    deferred.reject(response);

                    $scope.destaqueStr = response; 

                }

            );
            
            return deferred.promise;

        },
        
        searchByType: function($scope, token, limit, keyword, type) { 
            
            var deferred = $q.defer();
            
            var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/music/search/by",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",

                data: {token : token, limit : limit, keyword: keyword, searchType: type}
            });
            
            request.success(

                function( response ) {

                    deferred.resolve(response);

                }
            );

            request.error(

                function( response ) { 

                    deferred.reject(response);

                    $scope.destaqueStr = response; 

                }

            );
            
            return deferred.promise;

        }
        
    }
    
});
            
module.factory('setlistService', function($http, $q){
     
    return {
        
        getSetlists: function($scope, token) { 

            var deferred = $q.defer();
            
            var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/setlist/list",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                   },
                   dataType:"json",

                data: {token : token}
            });


            request.success(

                function( response ) {

                    deferred.resolve(response);

                }
            );

            request.error(
                
                    function( response ) { 
                        
                        deferred.reject(response);
                        $scope.destaqueStr = response; 
                        
                    }
            );
            
            return deferred.promise;
            
        },
        getSetlistDetail: function($scope, token, setlistId) { 

            var deferred = $q.defer();
            
            var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/setlist/get",
                    headers: {
                       "Accept": "application/json;charset=utf-8",
                   },
                   dataType:"json",

                data: {token : token, id: setlistId}
            });


            request.success(

                function( response ) {

                    deferred.resolve(response);

                    $scope.setlistMusics = response.musics;
                    $scope.setlistName = response.title;
                    $scope.setlistTime = response.totalTime;

                }
            );

            request.error(
                
                    function( response ) { 
                        
                        deferred.reject(response);
                        $scope.destaqueStr = response; 
                        
                    }
            );
            
            return deferred.promise;
            
        },
        updateSetlist: function($scope, token, setlistId, musicsId) { 

            var deferred = $q.defer();

            var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/setlist/update/musics",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                   },
                   dataType:"json",

                data: {token : token, idSetlist: setlistId, idsMusic: musicsId}
            });


            request.success(

                function( response ) {

                    deferred.resolve(response);

                }
            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);
                        $scope.destaqueStr = response; 

                    }
            );

            return deferred.promise;

        },
        removeSetlist: function($scope, token, setlistId) { 

            var deferred = $q.defer();

            var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/setlist/remove",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                   },
                   dataType:"json",

                data: {token : token, id: setlistId}
            });


            request.success(

                function( response ) {

                    deferred.resolve(response);

                }
            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);

                    }
            );

            return deferred.promise;

        },
        updateSetlistAttributes: function($scope, token, setlistId, setlistName, setlistGroupCode) { 

            var deferred = $q.defer();

            var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/setlist/update",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                   },
                   dataType:"json",

                data: {token : token, idSetlist: setlistId, groupCode: setlistGroupCode, setlistName: setlistName}
            });


            request.success(

                function( response ) {

                    deferred.resolve(response);

                }
            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);
                        $scope.destaqueStr = response; 

                    }
            );

            return deferred.promise;

        },
        updateMode: function($scope, token, idSetlist, idMusic, mode) { 

            var deferred = $q.defer();

            var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/setlist/update/mode",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                   },
                   dataType:"json",

                data: {token : token, idSetlist: idSetlist, idMusic: idMusic, mode: mode}
            });


            request.success(

                function( response ) {

                    deferred.resolve(response);

                }
            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);

                    }
            );

            return deferred.promise;

        },
        createSetlist: function($scope, token, name, groupCode) { 

            var deferred = $q.defer();

            var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/setlist/create",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                },
                dataType:"json",
                data: {token : token, name: name, groupCode: groupCode}
            });


            request.success(

                function( response ) {

                    deferred.resolve(response);

                }
            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);

                    }
            );

            return deferred.promise;

        }  
  


    }
      
     
 });

module.factory('wishlistService', function($http, $q){
     
    return {
        getWishlists: function($scope, token) { 

            var deferred = $q.defer();
            
            var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/music/wish",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                   },
                   dataType:"json",

                data: {token : token}
            });


            request.success(

                function( response ) {
                    
                    deferred.resolve(response);

                }
            );

            request.error(
                
                    function( response ) { 
                        
                        deferred.reject(response);
                        $scope.destaqueStr = response; 
                        
                    }
                
            );
            
            return deferred.promise;
            
        } 
    }
      
     
 });

module.factory('styleService', function($http, $q, $interval){
    
    return {
        
        getStyles : function($rootScope, $scope, token) { 

            var deferred = $q.defer();

            if ($rootScope.buffer.styles.valid){

                $interval(function(){deferred.resolve($rootScope.buffer.styles.data);}, 50, 1);

            }else{

                var request = $http({
                    method: "post",
                    url: "http://www.multisongs.audio/MultiSongs/api/style/list",
                headers: {
                    "Accept": "application/json;charset=utf-8"
                },
                    dataType:"json",
                    data: {token: token}
                });

                request.success(

                    function( response ) {

                        var remainder;
                        var counter;
                        var cardIndex;
                        var styleIndex;

                        $rootScope.buffer.styles.data = response;
                        $rootScope.buffer.styles.valid = true;

                        counter = 0;
                        cardIndex = -1;
                        styleIndex = -1;

                        $scope.styleCards = [];

                        $scope.styleCards[0] = [];                        

                        response.estilos.forEach(function (entry){

                            remainder = counter % 4;

                            if (remainder == 0) {

                                cardIndex++;
                                styleIndex = 0;

                                $scope.styleCards[cardIndex] = [];                        

                            } else {
                                styleIndex++;
                            }

                            $scope.styleCards[cardIndex][styleIndex] = entry;

                            entry.margin = (styleIndex==0)?"padding-right:2px;":
                                           (styleIndex==1 || styleIndex==2)?"padding-right:1px;padding-left:1px;":"padding-left:2px;";

                            counter++;

                        });

                        //$scope.musicStyles = response.estilos;
                        deferred.resolve(response);

                    }

                );

                request.error(

                        function( response ) { 

                            deferred.reject(response);
      
                        }

                );


            }

            
            return deferred.promise;

        }

    }

});


module.factory('musicService', function($http, $interval, $q){
    
    return {
        
        getNewSongs : function($rootScope, $scope, token) { 
            
            var deferred = $q.defer();


            if ($rootScope.buffer.newSongs.valid){
                 $interval(function(){deferred.resolve($rootScope.buffer.newSongs.data);}, 50, 1);
            } else {


                 var request = $http({
                    method: "post",
                    url: "http://www.multisongs.audio/MultiSongs/api/music/news",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                   },
                   dataType:"json",
                    data: {token: token, limit: 6}
                });


                request.success(

                    function( response ) {

                        deferred.resolve(response);

                        $rootScope.buffer.newSongs.data = response;
                        $rootScope.buffer.newSongs.valid = true;

                        $scope.newSongsRow1 = response.musicas.slice(0,3);
                        $scope.newSongsRow2 = response.musicas.slice(3,6);

                        $scope.newSongsRow1[0].margin="margin-right:6px";
                        $scope.newSongsRow1[1].margin="margin-right:3px;margin-left:3px";
                        $scope.newSongsRow1[2].margin="margin-left:6px";

                        $scope.newSongsRow2[0].margin="margin-right:6px";
                        $scope.newSongsRow2[1].margin="margin-right:3px;margin-left:3px";
                        $scope.newSongsRow2[2].margin="margin-left:6px";

                    }

                );

                request.error(

                        function( response ) { 

                            deferred.reject(response);
                            $scope.destaqueStr = response; 

                        }

                );
     
             }
           
            return deferred.promise;
            
        },
        getTopMusics : function($rootScope, $scope, token, limit) { 
            
            var deferred = $q.defer();

            if ($rootScope.buffer.topMusics.valid){
                $interval(function(){deferred.resolve($rootScope.buffer.topMusics.data);}, 50, 1);
            } else {

                 var request = $http({
                    method: "post",
                    url: "http://www.multisongs.audio/MultiSongs/api/music/top",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                    },
                    dataType:"json",
                    data: {token: token, limit: limit}
                });


                request.success(

                    function( response ) {
                        //$scope.destaqueStr = response;

                        $rootScope.buffer.topMusics.valid = true;
                        $rootScope.buffer.topMusics.data = response;

                        deferred.resolve(response);

                    }

                );

                request.error(

                        function( response ) { 

                            deferred.reject(response);
                            $scope.destaqueStr = response; 

                        }
                );

            }
            
            return deferred.promise;
                
        },
        changeFavorite : function($scope, token, musicId) { 
            
            var deferred = $q.defer();
            
             var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/music/favorite/change",
                headers: {
                   "Accept": "application/json;charset=utf-8"
                },
                dataType:"json",
                data: {token: token, id: musicId}
            });


            request.success(

                function( response ) {
                    //$scope.destaqueStr = response;

                    deferred.resolve(response);

                }

            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);
                        $scope.destaqueStr = response; 

                    }
            );
            
            return deferred.promise;
                
        },
        getRecentlyAdded : function($scope, token) { 
            
            var deferred = $q.defer();
            
             var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/music/recent",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
                data: {token: token}
            });

            request.success(

                function( response ) {

                    deferred.resolve(response);

                }

            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);
                        $scope.destaqueStr = response; 

                    }
            );
            
            return deferred.promise;
              
        },
        getMyMusics : function($scope, token) {
            
            var deferred = $q.defer();

            var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/music/mine",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
                data: {token: token}
            });


            request.success(

                function( response ) {

                    deferred.resolve(response);
                    $scope.musics = response.musicas;

                }

            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);
                        $scope.destaqueStr = response; 

                    }
            );
            
            return deferred.promise;
            
        },
        getSugestions : function($rootScope, $scope, token) {
            
            var deferred = $q.defer();

            if ($rootScope.buffer.sugestions.valid){
                $interval(function(){deferred.resolve($rootScope.buffer.sugestions.data);}, 50, 1);
            } else {

                 var request = $http({
                    method: "post",
                    url: "http://www.multisongs.audio/MultiSongs/api/music/suggestions",
                    headers: {
                       "Accept": "application/json;charset=utf-8"
                   },
                   dataType:"json",
                    data: {token: token}
                });


                request.success(

                    function( response ) {

                        $rootScope.buffer.sugestions.valid = true;
                        $rootScope.buffer.sugestions.data = response;

                        deferred.resolve(response);

                    }

                );

                request.error(

                        function( response ) { 

                            deferred.reject(response);
                            $scope.destaqueStr = response; 

                        }
                );

            }
            
            return deferred.promise;
            
        },
        buy : function($scope, id, token) {
            
            var deferred = $q.defer();
            
             var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/music/buy",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
               data: {token: token, id: id}
            });

            request.success(

                function( response ) {

                    deferred.resolve(response);
                    $scope.musics = response.musicas;

                }

            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);

                    }
            );
            
            return deferred.promise;
            
        },
        getMusicDetails : function($scope, token, musicId) {
            
            var deferred = $q.defer();

             var request = $http({
                method: "post",
                url: "http://www.multisongs.audio/MultiSongs/api/music/details",
                headers: {
                   "Accept": "application/json;charset=utf-8"
               },
               dataType:"json",
                data: {token: token, id : musicId}
            });


            request.success(

                function( response ) {

                    deferred.resolve(response);

                }
 
            );

            request.error(

                    function( response ) { 

                        deferred.reject(response);
                        $scope.destaqueStr = response; 

                    }
            );
            
            return deferred.promise;
            
        }

        
    }
      
     
 });



module.factory('countryService', function($http, $q){
     
    return {
        
        getCountries: function($scope) { 

            
            var request = $http({
                method: "get",
                url: "https://restcountries.eu/rest/v1/all",
                dataType:"json"
            });


            request.success(
                function( response ) {
                    //$scope.teste = "Email enviado com sucesso.";
                    $scope.countries = {availableCountries: response};
                }
            );

            request.error(
                    function( response ) { 

                    }
            );
            
        } 
    }
      
     
 });