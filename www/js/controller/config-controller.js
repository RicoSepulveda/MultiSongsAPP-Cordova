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

        $rootScope.callback = {func : function(args){}, args : "args"};

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

      $scope.justSubscribed = true;

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

              var codeOnStore;

              e.preventDefault();

              loginService.getDiscountCodes(auth.token, function(response){

                response.promocaoBeans.forEach(function (entry){

                  if (entry.codigo == $scope.discount.code){
                    codeOnStore = entry.codigoNaLoja;
                  }

                });

                loginService.registerSubscriptionAttempt(token, codeOnStore, token, function(result){

                  if(result.success){
                    store.order(codeOnStore, {developerPayload : token});
                  }else{
                    var result = document.getElementsByClassName("popup-sub-title");
                    angular.element(result).html($rootScope.i18.config.promotionCodeErrorDescriptionLabel);
                  }

                });

              });
/*
                console.log("Vai validar o codigo promocional " + $scope.discount.code);

                loginService.registerSubscriptionAttempt(token, $scope.promotion.discount.codigoNaLoja, token, function(){
                    store.order($scope.promotion.discount.codigoNaLoja, {developerPayload : token});
                });

                loginService.validateDiscountCode($scope.discount.code, auth.token, 

                  function(obj){

                    var alertPopup;

                    if (obj.success == true){

                      console.log("O codigo promocional eh valido. " + obj.bean);

                      $scope.discount.codeOnStore = obj.bean.codigoNaLoja;

                      try {
                        store.order(obj.bean.codigoNaLoja);
                      }catch(err){

                        alertPopup = $ionicPopup.alert({
                            title: "Ops!",
                            template: "Algo deu errado e não conseguimos realizar sua assinatura. Tente novamente um pouco mais tarde."
                        });

                        alertPopup.then(function(res) {
                        });

                      }

                      $scope.confirmPopup.close();

                    } else {

                      console.log("O codigo promocional eh invalido.");

                      var result = document.getElementsByClassName("popup-sub-title");

                      angular.element(result).html($rootScope.i18.config.promotionCodeErrorDescriptionLabel);

                    }

                  }

                );

              }
*/
            }
          }
        ]
      });

    }
/*
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
                  
                  if (auth.subscriptionCode != p.id){
                    loginService.subscribe(auth.token, p.id);
                  }
                  
                  p.finish();

              });

              store.when(entry.codigoNaLoja).unverified(function(p) {
                  console.log("subscription unverified");
              });

              store.when(entry.codigoNaLoja).updated(function(p) {

                  if (p.owned) {

                      if (auth.subscriptionCode != p.id){ // Por algum motivo a loja chama esse metodo varias vezes apos assinar o servico... 
                                                          // Essa verificacao eh para garantir que o codigo abaixo sera chamado somente uma vez

                        auth.type = 4; // USUARIO PREMIUM.
                        auth.subscriptionCode = p.id;

                        alertPopup = $ionicPopup.alert({
                            title: "Legal!",
                            template: "Sua assinatura da MultiSongs Premium está ativa. Agora você pode manter até 20 Playbacks Premium no seu celular."
                        });

                        alertPopup.then(function(res) {
                            //$scope.shouldCreate = false;
                            $scope.modal.hide();
                        });

                        $scope.discount.code = null;

                      } else if (auth.type == 4){
                        console.log("NOT OWNED = > " + p);
                      }


                  }
                  else {
                    if (p.id == auth.subscriptionCode){
                      // CANCELAR ASSINATURA!!
                      loginService.unsubscribe(auth.token, function(response){
                        auth.subscriptionCode = '';
                        auth.type = 2; // Usuario Basico...
                      });

                    }
                  }

              });

          }else{
              console.log("Product " + entry.codigoNaLoja + " ALREADY registered before.");
          }

        });

        store.ready(function() {

            console.log("\\o/ STORE READY \\o/");

          if ($stateParams.codigoNaLoja && $stateParams.codigoNaLoja != ''){ // So tenta realizar a compra se foi passado codigo de promocao como parametro da url
            store.order($stateParams.codigoNaLoja);
          }

        });

        store.refresh();

    }
*/
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

        $scope.auth = auth;
        $ionicNavBarDelegate.showBar(false);
/*
        $scope.justSubscribed = false; // Configura variavel de sessao que descreve quando o usuario clicou no botao de subscribe.
                                       // Usado no evento da loja de updated...
*/
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
        //promises.push(loginService.getDiscountCodes(auth.token, function(){}));

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

            $scope.discount = {code : window.localStorage.getItem("discount_id"), codeOnStore : null};

            //$scope.discount = {beans : response[1].promocaoBeans, code : $stateParams.codigoNaLoja, codeOnStore : null};
            //initStore();

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

