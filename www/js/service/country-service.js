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