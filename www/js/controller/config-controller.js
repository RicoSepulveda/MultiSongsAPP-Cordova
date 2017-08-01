module.controller('ConfigController', function($scope,
                                               $rootScope,
                                               $ionicNavBarDelegate,
                                               $location,
                                               $ionicPopup,
                                               $ionicModal,
                                               $q, 
                                               $stateParams,
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

    $scope.subscribe = function(objective){

      $scope.confirmPopup = $ionicPopup.show({
        template: '<input type="text" ng-model="discount.code">',
        title: $rootScope.i18.config.promotionCodeLabel,
        subTitle: $rootScope.i18.config.promotionCodeDescriptionLabel,
        scope: $scope,
        buttons: [
          {
            text: '<b>Continuar</b>',
            type: 'button-positive',
            onTap: function(e) {

              e.preventDefault();

              if (!$scope.discount.code) {

                console.log("Product id = " + window.localStorage.getItem("subscription_id"));

                $scope.discount.codeOnStore = window.localStorage.getItem("subscription_id");

                store.order(window.localStorage.getItem("subscription_id"));

                $scope.confirmPopup.close();

              } else {

                console.log("Vai validar o codigo promocional " + $scope.oferta.codigoNaLoja);

                loginService.validateDiscountCode($scope.discount.code, auth.token, 

                  function(obj){

                    if (obj.success == true){

                      console.log("O codigo promocional eh valido. " + obj.bean);

                      $scope.discount.codeOnStore = obj.bean.codigoNaLoja;

                      store.order(obj.bean.codigoNaLoja);

                      $scope.confirmPopup.close();

                    } else {

                      console.log("O codigo promocional eh invalido.");

                      var result = document.getElementsByClassName("popup-sub-title");

                      angular.element(result).html($rootScope.i18.config.promotionCodeErrorDescriptionLabel);

                    }

                  }

                );

              }
            }
          }
        ]
      });

    }

    var initStore = function(){

        var promisses = [];

        // Let's set a pretty high verbosity level, so that we see a lot of stuff
        // in the console (reassuring us that something is happening).
        store.verbosity = store.DEBUG;

        store.validator = function(product, callback) {

            callback(true, {}); // success!

            //callback(false, "Impossible to proceed with validation");

        };

        $scope.discount.beans.forEach(function (entry){

          if (!store.products.byId[entry.codigoNaLoja]){

              console.log("Product " + entry.codigoNaLoja + " was not registered before.");

              // We register a dummy product. It's ok, it shouldn't
              // prevent the store "ready" event from firing.
              store.register({
                  id:    entry.codigoNaLoja,
                  alias: entry.codigo,
                  type:  store.PAID_SUBSCRIPTION
              });

              store.when(entry.codigoNaLoja).approved(function(p) {
                  console.log("verify subscription");
                  p.verify();
              });

              store.when(entry.codigoNaLoja).verified(function(p) {
                  console.log("subscription verified");
                  p.finish();
              });

              store.when(entry.codigoNaLoja).unverified(function(p) {
                  console.log("subscription unverified");
              });

              store.when(entry.codigoNaLoja).updated(function(p) {

                  if (p.owned) {

                      $scope.discount.code = null;
                      auth.type = 4; // USUARIO PREMIUM. Esse codigo eh alterado quando o metodo subscribe eh chamado...

                        alertPopup = $ionicPopup.alert({
                            title: "Legal!",
                            template: "Sua assinatura da MultiSongs Premium está ativada. Agora você pode manter até 20 PSlaybacks Premium no seu celular."
                        });

                        alertPopup.then(function(res) {
                            $scope.shouldCreate = false;
                            $scope.modal.hide();
                        });

                        loginService.subscribe(auth.token, $scope.discount.code);

                  }
                  else {
                      console.log("Nao assinou...");
                  }

              });


          }else{
              console.log("Product " + entry.codigoNaLoja + " ALREADY registered before.");
          }

        });

        // When every goes as expected, it's time to celebrate!
        // The "ready" event should be welcomed with music and fireworks,
        // go ask your boss about it! (just in case)
        store.ready(function() {

            console.log("\\o/ STORE READY \\o/");

          if ($stateParams.codigoNaLoja && $stateParams.codigoNaLoja != ''){ // So tenta realizar a compra se foi passado codigo de promocao como parametro da url
            store.order($stateParams.codigoNaLoja);
          }

        });

        // After we've done our setup, we tell the store to do
        // it's first refresh. Nothing will happen if we do not call store.refresh()
        store.refresh();

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

        promises.push(configService.getAccountConfig(auth.token));
        promises.push(loginService.getDiscountCodes(auth.token, function(){}));

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

          $scope.discount = {beans : response[1].promocaoBeans, code : $stateParams.codigoNaLoja, codeOnStore : null};

          if ($scope.discount.code && $scope.discount.code != '' && $scope.discount.code != null){
            window.localStorage.setItem("subscription_code", $scope.discount.code); // Caso tenha passado por parametro...
          } else {
            $scope.discount.code = window.localStorage.getItem("subscription_code");
          }

          initStore();

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

