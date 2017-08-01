module.factory('setlistService', function($http, $q){
     
    return {
        
        getSetlists: function(token) { 

            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");
            
            var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/setlist/list",
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
                        
                    }
            );
            
            return deferred.promise;
            
        },
        getSetlistDetail: function(token, setlistId) { 

            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");
            
            var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/setlist/get",
                    headers: {
                       "Accept": "application/json;charset=utf-8",
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
                        $scope.destaqueStr = response; 
                        
                    }
            );
            
            return deferred.promise;
            
        },
        updateSetlist: function(token, setlistId, musicsId) { 

            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");

            var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/setlist/update/musics",
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

                    }
            );

            return deferred.promise;

        },
        removeSetlist: function(token, setlistId) { 

            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");

            var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/setlist/remove",
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
        updateSetlistAttributes: function(token, setlistId, setlistName, setlistGroupCode) { 

            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");

            var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/setlist/update",
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

                    }
            );

            return deferred.promise;

        },
        updateMode: function(token, idSetlist, idMusic, mode) { 

            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");

            var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/setlist/update/mode",
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
        createSetlist: function(token, name, groupCode) { 

            var deferred = $q.defer();

            var ms_hostname = window.localStorage.getItem("environment");

            var request = $http({
                method: "post",
                url: ms_hostname + "/MultiSongs/api/setlist/create",
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
