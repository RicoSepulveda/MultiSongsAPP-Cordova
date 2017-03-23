module.controller('ConfigController', function($scope,
                                               $rootScope,
                                               $ionicNavBarDelegate,
                                               $location,
                                               $ionicPopup,
                                               $ionicModal,
                                               $q, 
                                               auth,
                                               loginService,
                                               configService) {


    $scope.createAccount = function(){

        var instruments = "";
        var generes = "";
        var objectives = "";

        $rootScope.createAccountData.instruments.forEach(function(entry){
          instruments = instruments + ","  + entry;
        });

        $rootScope.createAccountData.generes.forEach(function(entry){
          generes = generes + ","  + entry;
        });

        $rootScope.createAccountData.objectives.forEach(function(entry){
          objectives = objectives + ","  + entry;
        });

        instruments = instruments.substring(1, instruments.length);
        generes = generes.substring(1, generes.length);
        objectives = objectives.substring(1, objectives.length);

        loginService.createAccount(auth.token, 
                                   $rootScope.createAccountData.key, 
                                   $rootScope.createAccountData.password, 
                                   $rootScope.createAccountData.name, 
                                   $rootScope.createAccountData.idiom, 
                                   $rootScope.createAccountData.country, 
                                   $rootScope.createAccountData.age,
                                   instruments,
                                   generes,
                                   objectives,
                                   function(response){

            if (response.success == true){
                
                auth.token = response.token;
                auth.type = response.userType;
                
                window.localStorage.setItem("key", $rootScope.createAccountData.key);
                window.localStorage.setItem("password", $rootScope.createAccountData.password);

                var alertPopup = $ionicPopup.alert({
                    title: $rootScope.i18.general.loggedInMessage,
                    template: $rootScope.i18.general.loggedInDescriptionMessage
                });

                alertPopup.then(function(res) {
                    $location.path("/");
                });

            } else {

                var errors = [];

                if (response.message != ""){

                  errors = response.message.split(";");

                  console.log(errors);
                  console.log(response.message);

                  $rootScope.errors = {name : "", key : "", password : "", age : ""};


                  errors.forEach(function(entry){

                    if (entry.trim().startsWith("name")){
                      $rootScope.errors.name = entry.trim().substring(5);
                    }

                    if (entry.trim().startsWith("key")){
                      $rootScope.errors.key = entry.trim().substring(4);
                    }

                    if (entry.trim().startsWith("password")){
                      $rootScope.errors.password = entry.trim().substring(9);
                    }

                    if (entry.trim().startsWith("age")){
                      $rootScope.errors.age = entry.trim().substring(4);
                    }

                  });

                }


            }
        })

    }

    $scope.logout = function(){
/*
        var key = msSessionConfig.defaultUser;
        var password = msSessionConfig.defaultPassword;
*/

        var key = window.localStorage.getItem("defaultKey");
        var password = window.localStorage.getItem("defaultPassword");

        window.localStorage.setItem("key", key);
        window.localStorage.setItem("password", password);

        var alertPopup = $ionicPopup.alert({
            title: $rootScope.i18.general.loggedOutMessage,
            template: $rootScope.i18.general.loggedOutDescriptionMessage
        });

        alertPopup.then(function(res) {
            $rootScope.buffer.config.valid = false; // Faz com que o config seja recarregado com o idioma do usuario logado.
            $rootScope.buffer.sugestions.valid = false; // Faz com que o sugestions seja recarregado com o recomendacoes do usuario logado.
            $location.path("/"); 
        });
             
    }

    $scope.openLogin = function(){

        $rootScope.description = $rootScope.i18.general.loginDescriptionMessage;
        $rootScope.originalDescription = $rootScope.description;

        $rootScope.callback = {func : function(args){$scope.userType = auth.type}, args : "args"};

        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $rootScope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $rootScope.loginModal = modal;
            $rootScope.loginModal.show();
        });

    }

    $scope.openPage = function(url){
        window.open(url, '_system');
    }

    $scope.changeInstrument = function(instrument){

      if(instrument.selected == false){
        instrument.selected = true;
        instrument.currentImagePath = instrument.imagePath + ".jpg";
        $rootScope.createAccountData.instruments.push(instrument.id);
      }else{
        instrument.selected = false;
        instrument.currentImagePath = instrument.imagePath + "-silhouette.jpg";
        rootScope.createAccountData.instruments.splice(rootScope.createAccountData.instruments.indexOf(instrument.id), 1);
      }

    }

    $scope.changeGenere = function(genere){

      if(genere.selected == false){
        genere.selected = true;
        genere.currentImagePath = genere.accountImage + ".jpg";
        $rootScope.createAccountData.generes.push(genere.id);
      }else{
        genere.selected = false;
        genere.currentImagePath = genere.accountImage + "-silhouette.jpg";
        rootScope.createAccountData.generes.splice(rootScope.createAccountData.generes.indexOf(genere.id), 1);
      }

    }

    $scope.changeObjective = function(objective){

      if(objective.selected == false){
        objective.selected = true;
        objective.currentImagePath = objective.imagePath + "-small.jpg";
        $rootScope.createAccountData.objectives.push(objective.id);
      }else{
        objective.selected = false;
        objective.currentImagePath = objective.imagePath + "-small-silhouette.jpg";
        rootScope.createAccountData.objectives.splice(rootScope.createAccountData.objectives.indexOf(objective.id), 1);
      }

    }

    $scope.$watch('$viewContentLoaded', function() {
        
        var promises = [];

        $scope.userType = auth.type;
        $ionicNavBarDelegate.showBar(false);

        console.log(auth.token);

        $rootScope.createAccountData = {key : "", 
                                        password : "", 
                                        name : "", 
                                        idiom : $rootScope.preferredLanguage + "-" + $rootScope.locale, 
                                        country : $rootScope.locale,
                                        age : "",
                                        instruments: [],
                                        objectives : [],
                                        generes : []};

        promises.push(configService.getAccountConfig($rootScope, auth.token));

        $q.all(promises).then(

          function(response) { 

            var instruments;
            var objectives;
            var generes;

            response[0].instruments.forEach(function (entry){
              entry.selected = false;
              entry.currentImagePath = entry.imagePath + "-silhouette.jpg";
            });

            response[0].objectives.forEach(function (entry){
              entry.selected = false;
              entry.currentImagePath = entry.imagePath + "-small-silhouette.jpg";
            });

            response[0].generes.forEach(function (entry){
              entry.selected = false;
              entry.currentImagePath = entry.accountImage + "-silhouette.jpg";
            });

            instruments = {line1 : response[0].instruments.slice(0,4), 
                           line2 : response[0].instruments.slice(4,8),
                           line3 : response[0].instruments.slice(8)
                          };

            objectives = {line1 : response[0].objectives.slice(0,2),
                          line2 : response[0].objectives.slice(2)
                          };

            generes = {line1 : response[0].generes.slice(0,4),
                       line2 : response[0].generes.slice(4,8),
                       line3 : response[0].generes.slice(8)
                      };


          $scope.accountConfig = {instruments : instruments,
                                  objectives : objectives,
                                  generes : generes};

          console.log($scope.accountConfig);

        },
            function() { 
                $scope.teste = 'Failed'; 
            }

        );

    });        


    $scope.options = {
        pagination: '.custom-swiper-pagination',
        paginationHide: false,
        paginationClickable: true
    };

    $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
      // data.slider is the instance of Swiper
      $scope.slider = data.slider;
    });

    $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
      console.log('Slide change is beginning');
    });

    $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
      // note: the indexes are 0-based
      $scope.activeIndex = data.slider.activeIndex;
      $scope.previousIndex = data.slider.previousIndex;
    });

});

