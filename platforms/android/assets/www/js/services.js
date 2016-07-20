

module.factory('featuredMusicService', function($http, $q){
     
    return {
        
        getFeaturedMusics: function($scope, token) { 
              
            var deferred = $q.defer();
            
            var request = $http({
                method: "post",
                url: "http://localhost:8180/MultiSongs/api/featured/list",
                headers: {
                   "Accept": "application/json;charset=utf-8",
                   "Accept-Charset":"charset=utf-8"
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
                    }
            );

            return deferred.promise;
            
        } 
    }
      
     
 });

module.factory('configService', function($http, $q){
     
    return {
        
        getConfig: function($scope, token, sessionConfig) { 
              
            var deferred = $q.defer();
            
            var request = $http({
                method: "post",
                url: "http://localhost:8180/MultiSongs/api/general/config",
                headers: {
                   "Accept": "application/json;charset=utf-8",
                   "Accept-Charset":"charset=utf-8"
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

module.factory('loginService', function($http){
    
    return {
        
        login: function($scope, key, password, callbackFunction) { 

            $scope.debugTxt = "chamando login..."; 
            
             var request = $http({
                method: "post",
                url: "http://localhost:8180/MultiSongs/api/auth/login",
                headers: {
                   "Accept": "application/json;charset=utf-8",
                   "Accept-Charset":"charset=utf-8"
               },
               dataType:"json",
               data: {key : key, password: password}
            });


            request.success(
                function( response ) {

                    this.token = response.token;

                    $scope.debugTxt = response; 

                    callbackFunction(response);
                }
            );

            request.error(
                function( response , textStatus, errorThrown) { 
                    $scope.debugTxt = response + " - " + errorThrown + " - " + textStatus; 
                }
            );

        } 
    }
     
});


module.factory('artistService', function($http, $q){
     
    return {
        
        getTopArtists: function($scope, token, limit) { 
            
            var deferred = $q.defer();
            
            var request = $http({
                method: "post",
                url: "http://localhost:8180/MultiSongs/api/artist/top",
                headers: {
                   "Accept": "application/json;charset=utf-8",
                   "Accept-Charset":"charset=utf-8"
               },
               dataType:"json",

                data: {token : token, limit : limit}
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

module.factory('searchService', function($http, $q){
     
    return {
        
        searchByKeyword: function($scope, token, limit, keyword) { 
            
            var deferred = $q.defer();
            
            var request = $http({
                method: "post",
                url: "http://localhost:8180/MultiSongs/api/music/search/keyword",
                headers: {
                   "Accept": "application/json;charset=utf-8",
                   "Accept-Charset":"charset=utf-8"
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

        }
        
    }
    
});
            
module.factory('setlistService', function($http, $q){
     
    return {
        
        getSetlists: function($scope, token) { 

            var deferred = $q.defer();
            
            var request = $http({
                method: "post",
                url: "http://localhost:8180/MultiSongs/api/setlist/list",
                    headers: {
                       "Accept": "application/json;charset=utf-8",
                       "Accept-Charset":"charset=utf-8"
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
                url: "http://localhost:8180/MultiSongs/api/setlist/get",
                    headers: {
                       "Accept": "application/json;charset=utf-8",
                       "Accept-Charset":"charset=utf-8"
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
                url: "http://localhost:8180/MultiSongs/api/setlist/update/musics",
                    headers: {
                       "Accept": "application/json;charset=utf-8",
                       "Accept-Charset":"charset=utf-8"
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
                url: "http://localhost:8180/MultiSongs/api/setlist/remove",
                    headers: {
                       "Accept": "application/json;charset=utf-8",
                       "Accept-Charset":"charset=utf-8"
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
                url: "http://localhost:8180/MultiSongs/api/setlist/update",
                    headers: {
                       "Accept": "application/json;charset=utf-8",
                       "Accept-Charset":"charset=utf-8"
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
                url: "http://localhost:8180/MultiSongs/api/setlist/update/mode",
                    headers: {
                       "Accept": "application/json;charset=utf-8",
                       "Accept-Charset":"charset=utf-8"
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
                url: "http://localhost:8180/MultiSongs/api/setlist/create",
                    headers: {
                       "Accept": "application/json;charset=utf-8",
                       "Accept-Charset":"charset=utf-8"
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
                url: "http://localhost:8180/MultiSongs/api/music/wish",
                    headers: {
                       "Accept": "application/json;charset=utf-8",
                       "Accept-Charset":"charset=utf-8"
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

module.factory('musicService', function($http, $q){
    
    return {
        
        getNewSongs : function($scope, token) { 
            
            var deferred = $q.defer();
            
             var request = $http({
                method: "post",
                url: "http://localhost:8180/MultiSongs/api/music/news",
                headers: {
                   "Accept": "application/json;charset=utf-8",
                   "Accept-Charset":"charset=utf-8"
               },
               dataType:"json",
                data: {token: token, limit: 6}
            });


            request.success(

                function( response ) {

                    deferred.resolve(response);

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
            
            return deferred.promise;
            
        },
        getTopMusics : function($scope, token, limit) { 
            
            var deferred = $q.defer();
            
             var request = $http({
                method: "post",
                url: "http://localhost:8180/MultiSongs/api/music/top",
                headers: {
                   "Accept": "application/json;charset=utf-8",
                   "Accept-Charset":"charset=utf-8"
                },
                dataType:"json",
                data: {token: token, limit: limit}
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
        changeFavorite : function($scope, token, musicId) { 
            
            var deferred = $q.defer();
            
             var request = $http({
                method: "post",
                url: "http://localhost:8180/MultiSongs/api/music/favorite/change",
                headers: {
                   "Accept": "application/json;charset=utf-8",
                   "Accept-Charset":"charset=utf-8"
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
                url: "http://localhost:8180/MultiSongs/api/music/recent",
                headers: {
                   "Accept": "application/json;charset=utf-8",
                   "Accept-Charset":"charset=utf-8"
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
                url: "http://localhost:8180/MultiSongs/api/music/mine",
                headers: {
                   "Accept": "application/json;charset=utf-8",
                   "Accept-Charset":"charset=utf-8"
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
            
        }

        
    }
      
     
 });
