var module = angular.module('ionicApp', ['ionic']);


module.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.tabs.position('bottom');

   $stateProvider
   .state('index', { 
       cache: true,
       url: '/', 
       views: {
            "store-view": {
                templateUrl: "pages/store.html",
                controller: "IndexController",
                onEnter: function($rootScope){
                  $rootScope.$broadcast('storeEnter', '');
                  //$scope.debugTxt = "Legal!!";
                }

            }
        }
   })
   .state('wishlist', { 
       cache: false,
       url: '/wishlist', 
       views: {
            "favorite-view": {
                templateUrl: "pages/wishlist.html",
                controller: "WishlistController"
            }
        }
   })
   .state('musics', { 
       cache: true,
       url: '/musics', 
       views: {
            "musics-view": {
                templateUrl: "pages/musics.html",
                controller: "MyMusicsController"
            }
        }
   })
   .state('search', { 
       cache: true,
       url: '/search/:keyword', 
       views: {
            "store-view": {
                templateUrl: "pages/searchResult.html",
                controller: "SearchController"
            }
        }
   })
   .state('config', { 
       cache: false,
       url: '/config', 
       views: {
            "config-view": {
                templateUrl: "templates/level.html",
                controller: "TrackController"
            }
        }
   })
   .state('showTracks', { 
       cache: false,
       url: '/tracks/:musicId', 
       views: {
            "store-view": {
                templateUrl: "templates/level.html",
                controller: "TrackController"
            }
        }
   })
   .state('searchByType', { 
       cache: true,
       url: '/searchByType/:type/:keyword', 
       views: {
            "store-view": {
                templateUrl: "pages/searchByType.html",
                controller: "SearchByTypeController"
            }
        }
   })
   .state('setlistDetail', { 
       cache: true,
       url: '/setlistDetail/:id', 
       views: {
            "setlists-view": {
                templateUrl: "pages/setlistDetail.html",
                controller: "SetlistDetailController"
            }
        }
   })
   .state('setlist', { 
       cache: true,
       url: '/setlist', 
       views: {
            "setlists-view": {
                templateUrl: "pages/setlist.html",
                controller: "SetlistController"
            }
        }
   });

    $urlRouterProvider.otherwise('/'); 
    
});

module.provider("auth", [function () {
    
  var token;
    
  return {
      
    setType: function (value) {
      token = value;
    },
    $get: function () {
      return {
        token: token
      };
    }
  };
    
}]);



module.provider("msSession", [function () {
    
  var tempTitle;
    
  return {
      
    setTempTitle: function (value) {
      tempTitle = value;
    },
    $get: function () {
      return {
        tempTitle: tempTitle
      };
    }
  };
    
}]);

module.provider("msSessionConfig", [function () {
    
  var storeBarTitle;
  var myWishlistBarTitle;
  var mySongsBarTitle;
  var mySetListsBarTitle;
    
  var newSongsButtom;
  var topSongsButtom;
  var topArtistsButtom;
    
  var storeMenu;
  var wishlistMenu;
  var musicMenu;
  var setlistMenu;
  var configMenu;
    
  return {
      
    setStoreBarTitle: function (value) {
      storeBarTitle = value;
    },
    setMyWishlistBarTitle: function (value) {
        myWishlistBarTitle = value;
    },
    setMySongsBarTitle: function (value) {
        mySongsBarTitle = value;
    },
    setMySetlistsBarTitle: function (value) {
        mySetListsBarTitle = value;
    },
    setNewSongsButtom: function (value) {
        newSongsButtom = value;
    },
    setTopSongsButtom: function (value) {
        topSongsButtom = value;
    },
    setTopArtistsButtom: function (value) {
        topArtistsButtom = value;
    },
    setStoreMenu: function (value) {
        storeMenu = value;
    },
    setWishlistMenu: function (value) {
        wishlistMenu = value;
    },
    setMusicMenu: function (value) {
        musicMenu = value;
    },
    setSetlistMenu: function (value) {
        setlistMenu = value;
    },
    setConfigMenu: function (value) {
        configMenu = value;
    },
    $get: function () {
      return {
          
          storeBarTitle: storeBarTitle,
          myWishlistBarTitle: myWishlistBarTitle,
          mySongsBarTitle: mySongsBarTitle,
          mySetListsBarTitle: mySetListsBarTitle,
          newSongsButtom: newSongsButtom,
          topSongsButtom: topSongsButtom,
          topArtistsButtom: topArtistsButtom,
          storeMenu: storeMenu,
          wishlistMenu: wishlistMenu,
          musicMenu: musicMenu,
          setlistMenu: setlistMenu,
          configMenu: configMenu
          
      };
    }
  };
    
}]);

//module.run(['$route', function() {}]);
