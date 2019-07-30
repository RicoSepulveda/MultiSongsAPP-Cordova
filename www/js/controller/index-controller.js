module.controller('IndexController', function($scope, 
                                              $rootScope,
                                              $q,
                                              $ionicNavBarDelegate,
                                              $ionicListDelegate,
                                              $rootScope,
                                              $ionicModal,
                                              $ionicPopup,
                                              $interval,
                                              $ionicLoading,
                                              $location,
                                              featuredMusicService, 
                                              musicService, 
                                              artistService, 
                                              loginService,
                                              configService,
                                              styleService,
                                              wishlistService,
                                              promotionService,
                                              auth,
                                              msSessionConfig,
                                              miniPlayer) {

    //$ionicNavBarDelegate.showBar(true);

    var TIPO_PROMOCAO_ASSINATURA_ESPECIAL = 1;
    var TIPO_PROMOCAO_PRESENTE_FISICO = 2;
    var TIPO_PROMOCAO_VOLUNTARIA = 3;

    $scope.openMusicModal = function(music){

        $scope.modal.show();

    }

    var changeFavoriteIfLogged = function(music){

        var promises = [];
        
        $ionicListDelegate.closeOptionButtons();

        promises.push(musicService.changeFavorite(auth.token, music.musicId));

        $q.all(promises).then(
            function(response) { 
            }
        );

    }

    $scope.changeFavorite = function(music){
        
        loginService.validateAuthorization($rootScope.i18.general.bloquedResourceMessage, changeFavoriteIfLogged, music);

    };

    var loadConfig = function(){

        var promises = [];

        $rootScope.environment = window.localStorage.getItem("environment");

        $scope.token = auth.token;

        if (!$rootScope.buffer){
            $rootScope.buffer = {styles : {valid : false}, account : {valid : false}, sugestions : {valid : false}, topMusics : {valid : false}, newSongs : {valid : false}, config : {valid : false}, featuredMusicSet : [], featuredMusicSets : {valid : false}, topArtists : {valid : false}};
        }

        promises.push(configService.getConfig(token, msSessionConfig));
        promises.push(featuredMusicService.getFeaturedMusicSets(token));
        promises.push(musicService.getNewSongs(token, 6));
        promises.push(musicService.getTopMusics(token, 5));
        promises.push(artistService.getTopArtists(token, 5));
        promises.push(styleService.getStyles(token));
        promises.push(wishlistService.getWishlists(token));
        promises.push(loginService.getDiscountCodes(token, function(){}));

        $q.all(promises).then(

            function(response) { 

                var general = {

                    notLoggedInMessage : response[0].generalBean.notLoggedInMessage,
                    passwordLabel : response[0].generalBean.passwordLabel,
                    forgotPasswordMessage : response[0].generalBean.forgotPasswordMessage,
                    createAccountLabel : response[0].generalBean.createAccountLabel,
                    nameLabel : response[0].generalBean.nameLabel,
                    idiomLabel : response[0].generalBean.idiomLabel,
                    countryLabel : response[0].generalBean.countryLabel, 
                    createAccount : response[0].generalBean.createAccount,
                    storeMenuTitleLabel : response[0].generalBean.storeMenuTitleLabel,
                    wishlistMenuTitleLabel : response[0].generalBean.wishlistMenuTitleLabel,
                    setlistMenuTitleLabel : response[0].generalBean.setlistMenuTitleLabel,
                    musicMenuTitleLabel : response[0].generalBean.musicMenuTitleLabel,
                    configMenuTitleLabel : response[0].generalBean.configMenuTitleLabel,
                    emailLabel : response[0].generalBean.emailLabel,
                    ageLabel : response[0].generalBean.ageLabel,
                    loginDescriptionMessage : response[0].generalBean.loginDescriptionMessage,
                    bloquedResourceMessage : response[0].generalBean.bloquedResourceMessage,
                    loggedInMessage : response[0].generalBean.loggedInMessage,
                    createAccountDescriptionMessage : response[0].generalBean.createAccountDescriptionMessage,
                    loginErrorDescriptionMessage : response[0].generalBean.loginErrorDescriptionMessage,
                    loggedOutMessage : response[0].generalBean.loggedOutMessage,
                    loggedOutDescriptionMessage : response[0].generalBean.loggedOutDescriptionMessage,
                    loggedInDescriptionMessage : response[0].generalBean.loggedInDescriptionMessage,
                    buyLabel : response[0].generalBean.buyLabel,
                    removeLabel : response[0].generalBean.removeLabel,
                    logoutLabel : response[0].generalBean.logoutLabel,
                    loginLabel : response[0].generalBean.loginLabel,
                    editLabel : response[0].generalBean.editLabel,
                    removeLabel : response[0].generalBean.removeLabel,
                    saveLabel : response[0].generalBean.saveLabel,
                    cancelLabel : response[0].generalBean.cancelLabel,
                    wishlistButtonLabel : response[0].generalBean.wishlistLabel


                };

                var store = {

                    barTitleLabel : response[0].storeBean.barTitleLabel,
                    newSongsLabel : response[0].storeBean.newSongsLabel,
                    topSongsLabel : response[0].storeBean.topSongsLabel,
                    stylesLabel : response[0].storeBean.stylesLabel,
                    topArtistsLabel : response[0].storeBean.topArtistsLabel,
                    newSongsButtonLabel : response[0].storeBean.newSongsButtonLabel,
                    topSongsButtonLabel : response[0].storeBean.topSongsButtonLabel,
                    topArtistsButtonLabel : response[0].storeBean.topArtistsButtonLabel

                };

                var wishlist = {
                    suggestionsLabel : response[0].wishlistBean.suggestionsLabel,
                    barTitleLabel : response[0].wishlistBean.barTitleLabel,
                    playbacksLabel : response[0].wishlistBean.playbacksLabel,
                    tutorialLabel : response[0].wishlistBean.tutorialLabel,
                    tutorialDescriptionLabel : response[0].wishlistBean.tutorialDescriptionLabel
                };

                var setlist = {
                    barTitleLabel : response[0].setlistBean.barTitleLabel,
                    addLabel : response[0].setlistBean.addLabel,
                    createLabel : response[0].setlistBean.createLabel,
                    nameLabel : response[0].setlistBean.nameLabel,
                    typeLabel : response[0].setlistBean.typeLabel,
                    showLabel : response[0].setlistBean.showLabel,
                    rehearsalLabel : response[0].setlistBean.rehearsalLabel,
                    presentationLabel : response[0].setlistBean.presentationLabel,
                    trainningLabel : response[0].setlistBean.trainningLabel,
                    classLabel : response[0].setlistBean.classLabel,
                    otherLabel : response[0].setlistBean.otherLabel,
                    tutorialLabel :  response[0].setlistBean.tutorialLabel,
                    tutorialDescriptionLabel : response[0].setlistBean.tutorialDescriptionLabel,
                    createdMessageTitle : response[0].setlistBean.createdMessageTitle,
                    createdMessage : response[0].setlistBean.createdMessage,
                    dropMessageTitle : response[0].setlistBean.dropMessageTitle,
                    dropMessage : response[0].setlistBean.dropMessage
                };

                var musics = {
                    backingTracksLabel : response[0].musicsBean.backingTracksLabel,
                    recentlyAddedLabel : response[0].musicsBean.recentlyAddedLabel,
                    barTitleLabel : response[0].musicsBean.barTitleLabel,
                    tutorialLabel : response[0].musicsBean.tutorialLabel,
                    tutorialDescriptionLabel : response[0].musicsBean.tutorialDescriptionLabel
                };

                var search = {
                    resultLabel : response[0].searchBean.resultLabel,
                    playbacksLabel : response[0].searchBean.playbacksLabel,
                    artistsLabel : response[0].searchBean.artistsLabel,
                    stylesLabel : response[0].searchBean.stylesLabel,
                    studiosLabel : response[0].searchBean.studiosLabel,
                    albunsLabel : response[0].searchBean.albunsLabel
                };

                var player = {
                    modeLabel : response[0].playerBean.modeLabel,
                    setlistLabel : response[0].playerBean.setlistLabel,
                    automaticLabel : response[0].playerBean.automaticLabel,
                    manualLabel : response[0].playerBean.manualLabel,
                    freeDownloadLabel : response[0].playerBean.freeDownloadLabel,
                    downloadCompleteLabel : response[0].playerBean.downloadCompleteLabel,
                    downloadingLabel : response[0].playerBean.downloadingLabel,
                    availableLabel : response[0].playerBean.availableLabel,
                    saveButtonLabel : response[0].playerBean.saveButtonLabel
                };

                var config = {
                    descriptionLabel : response[0].configBean.descriptionLabel,
                    socialLabel : response[0].configBean.socialLabel,
                    disclaimerLabel : response[0].configBean.disclaimerLabel,
                    barTitleLabel : response[0].configBean.barTitleLabel,
                    subscriptionButtonLabel : response[0].configBean.subscriptionButtonLabel,
                    subscriptionLabel : response[0].configBean.subscriptionLabel,
                    promotionCodeLabel : response[0].configBean.promotionCodeLabel,
                    promotionCodeDescriptionLabel : response[0].configBean.promotionCodeDescriptionLabel,
                    commentsLabel : response[0].configBean.commentsLabel,
                    promotionCodeErrorDescriptionLabel : response[0].configBean.promotionCodeErrorDescriptionLabel
                };

                var account = {
                    firstQuestion : response[0].accountBean.instrumentsQuestion,
                    secondQuestion : response[0].accountBean.genresQuestion,
                    thirdQuestion : response[0].accountBean.useQuestion,
                    fourthQuestion : response[0].accountBean.personalDataQuestion
                };

                var setlistDetail = {
                    barTitleLabel : response[0].setlistDetailBean.barTitleLabel,
                    setlistMusicsLabel : response[0].setlistDetailBean.setlistMusicsLabel,
                    tutorialLabel : response[0].setlistDetailBean.tutorialLabel,
                    tutorialDescriptionLabel : response[0].setlistDetailBean.tutorialDescriptionLabel,
                    automaticOptionLabel : response[0].setlistDetailBean.automaticOptionLabel,
                    manualOptionLabel : response[0].setlistDetailBean.manualOptionLabel,
                    addRemoveButtonLabel : response[0].setlistDetailBean.addRemoveButtonLabel,
                    musicSelectionLabel : response[0].setlistDetailBean.musicSelectionLabel,
                    totalTimeLabel : response[0].setlistDetailBean.totalTimeLabel
                };


                $rootScope.i18 = {general : general, 
                                  store : store, 
                                  wishlist : wishlist, 
                                  musics : musics, 
                                  search : search, 
                                  setlist : setlist, 
                                  player : player,
                                  account : account,
                                  setlistDetail : setlistDetail,
                                  config : config};
                
                msSessionConfig.storeBarTitle = response[0].storeBarTitle;
                msSessionConfig.myWishlistBarTitle = response[0].myWishlistSongsBarTitle;
                msSessionConfig.mySongsBarTitle = response[0].mySongsBarTitle;
                msSessionConfig.mySetListsBarTitle = response[0].mySetListsBarTitle;

                msSessionConfig.newSongsButtom = response[0].newSongsButtom;
                msSessionConfig.topSongsButtom = response[0].topSongsButtom;
                msSessionConfig.topArtistsButtom = response[0].topArtistsButtom;
                msSessionConfig.stylesButtom = response[0].stylesButtom;

                msSessionConfig.storeMenu = response[0].storeMenu;
                msSessionConfig.wishlistMenu = response[0].wishlistMenu;
                msSessionConfig.musicMenu = response[0].musicMenu;
                msSessionConfig.setlistMenu = response[0].setlistMenu;
                msSessionConfig.configMenu = response[0].configMenu;


                $scope.featuredSongs = response[1].featured;
                
                $scope.newSongsRow1 = response[2].musicas.slice(0,3);
                $scope.newSongsRow2 = response[2].musicas.slice(3,6);

                $scope.newSongsRow1[0].margin="margin-right:6px";
                $scope.newSongsRow1[1].margin="margin-right:3px;margin-left:3px";
                $scope.newSongsRow1[2].margin="margin-left:6px";

                $scope.newSongsRow2[0].margin="margin-right:6px";
                $scope.newSongsRow2[1].margin="margin-right:3px;margin-left:3px";
                $scope.newSongsRow2[2].margin="margin-left:6px";

                $scope.topMusics = response[3].musicas;

                $scope.topArtists = response[4].artistas;
                
                $ionicNavBarDelegate.showBar(true);
                $ionicNavBarDelegate.title($rootScope.i18.store.barTitleLabel);

                createStyles(response[5]);
                
                $scope.wishlist = response[6];

                if ($scope.wishlist) {

                    for (var idx = 0; idx < $scope.wishlist.length; idx++){
                        
                        $scope.topMusics[idy].favorite = false;
                        
                        for (var idy = 0; idy < $scope.topMusics.length; idy++){
                            
                            if ($scope.topMusics[idy].id == $scope.wishlist[idx].id){
                                $scope.topMusics[idy].favorite = true;
                            }
                            
                        }
                        
                    }

                }

                $rootScope.discount = {beans : response[7].promocaoBeans, code : '', codeOnStore : null};

                //$scope.loadingModal.hide();

                initStore();
                
            },
            function() { 
                $scope.teste = 'Failed'; 
            }
        ).finally(function() {
            $ionicLoading.hide();
        });
               
    }

    var createStyles = function(obj){

        var remainder;
        var counter;
        var cardIndex;
        var styleIndex;
        var styles = {styleCards : []};

        counter = 0;
        cardIndex = -1;
        styleIndex = -1;

        styles.styleCards[0] = [];                        

        obj.estilos.forEach(function (entry){

            remainder = counter % 4;

            if (remainder == 0) {

                cardIndex++;
                styleIndex = 0;

                styles.styleCards[cardIndex] = [];                        

            } else {
                styleIndex++;
            }

            styles.styleCards[cardIndex][styleIndex] = entry;

            entry.margin = (styleIndex==0)?"padding-right:2px;":
                           (styleIndex==1 || styleIndex==2)?"padding-right:1px;padding-left:1px;":"padding-left:2px;";

            counter++;

        });

        $scope.styleCards = styles.styleCards;

    }

    document.addEventListener("deviceready", function(){

        navigator.globalization.getLocaleName(function(result){

            $rootScope.preferredLanguage = result.value.substring(0, 2);
            $rootScope.locale = result.value.substring(3,5);

            startLoading();
            //loadPlayer();

            $scope.miniPlayer = miniPlayer;

            //miniPlayer.loadPlayer();

            $scope.intervals = [];

            $scope.newPlaybackRequest = {musicName : "", artistName : ""};

        }, function(err){console.log(err)});
        
    }, false);


    $scope.$watch("$viewContentLoaded", function() {

    });

    var startLoading = function(){

        var key;
        var password;
        var mobileToken;
        var promises = [];
        var spinner = '<ion-spinner icon="dots" class="spinner-stable"></ion-spinner><br/>';

        if (window.localStorage.getItem("key")){
        }else{
            chooseUserByIdiom($rootScope.preferredLanguage + "-" + $rootScope.locale);
        }

        $ionicLoading.show({ template: spinner + 'Carregando músicas...' });

        key = window.localStorage.getItem("key");
        password = window.localStorage.getItem("password");

        if (window.localStorage.getItem("mobile_token")){
            mobileToken = window.localStorage.getItem("mobile_token");
        }else{
            mobileToken = window.location.origin.substring(7) + "/" + (Math.random() * 100000);
            window.localStorage.setItem("mobile_token", mobileToken);
        }
        
        loginService.login(key, password, mobileToken, function(response){

            promises.push(promotionService.getPromotion(response.token));

            $q.all(promises).then(

                function(response) {
                    $scope.promotion = response[0].bean;
                },
                function() {
                    $scope.promotion = null;
                }
            );

            $interval(function(){
                cordova.exec(function(message){console.log(message)}, function(erro){console.log("ERRO ao chamar log!" + erro)}, "MultiSongsPlugin", "log", []);
            },1000);

            loadConfig();

        });

    }

    var chooseUserByIdiom = function(lang){

        var loginData;

        if (lang == "pt-BR"){
            window.localStorage.setItem("defaultKey", msSessionConfig.portugueseDefaultUser);
            window.localStorage.setItem("defaultPassword", msSessionConfig.portugueseDefaultPassword);
            loginData = {key : msSessionConfig.portugueseDefaultUser, password : msSessionConfig.portugueseDefaultPassword};
        } else {
            window.localStorage.setItem("defaultKey", msSessionConfig.englishDefaultUser);
            window.localStorage.setItem("defaultPassword", msSessionConfig.englishDefaultPassword);
            loginData = {key : msSessionConfig.englishDefaultUser, password : msSessionConfig.englishDefaultPassword};
        }

        window.localStorage.setItem("key", loginData.key);
        window.localStorage.setItem("password", loginData.password);

    }    

    $ionicModal.fromTemplateUrl('templates/newPlaybackRequest.html', {
        scope: $scope,
        controller: 'SearchController',
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/promotion/promotion.html', {
        scope: $scope,
        controller: 'IndexController',
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.promotionModal = modal;
    });

    $scope.createPrivateDiscountCode = function(){

        var confirmPopup;
        var alertPopup;
        
        $scope.shouldCreate = true;

        $scope.promotion.questions.forEach(function (entry){

            if(entry.mandatory && (!entry.answer || entry.answer == '') && $scope.shouldCreate){

                $scope.shouldCreate = false;

                alertPopup = $ionicPopup.alert({
                    title: "Ops!",
                    template: "Você precisa responder todas as questões antes de enviar suas respostas..."
                });

                alertPopup.then(function(res) {
                    $scope.modal.hide();
                });

            }

        });

        if ($scope.shouldCreate){

            // Se for uma promocao do tipo assinatura especial...
            if ($scope.promotion.discount.tipo == TIPO_PROMOCAO_ASSINATURA_ESPECIAL){

                loginService.createPrivateDiscountCodes(auth.token, $scope.promotion.id, function(obj){

                    $scope.confirmPopup = $ionicPopup.confirm({
                        title: "Obrigado!",
                        template: "Sua contribuição é muito importante e por isso você tem direito a '" + $scope.promotion.discount.direito + "'. Quer resgatar seu prêmio agora?"

                    });

                    $scope.confirmPopup.then(function(res) {

                        if(res) {

                            $scope.promotionModal.hide();

                            loginService.registerSubscriptionAttempt(token, $scope.promotion.discount.codigoNaLoja, token, function(result){
                              
                              if(result.success){
                                store.order($scope.promotion.discount.codigoNaLoja, {developerPayload : token});
                              }

                            });

                        } else {
        
                            window.localStorage.setItem("discount_id", $scope.promotion.discount.codigo);
        
                        }

                    });

                });

            } else {

                var alertPopup = $ionicPopup.alert({
                    title: "Obrigado!",
                    template: $scope.promotion.thanksMessage
                });

                alertPopup.then(function(res) {
                    $scope.modal.hide();
                });

            }

        }

    }

    $scope.setAnswers = function(questionId, answer){

        console.log($scope.promotion );

        if ($scope.intervals[questionId]  && $scope.intervals[questionId] != null){
            $interval.cancel($scope.intervals[questionId]);
        }

        $scope.intervals[questionId] = $interval(function(){
            
            console.log("Enviando resposta para servidor");
            
            promotionService.setAnswer($scope.promotion.id, questionId, auth.token, answer);
            
            $scope.intervals[questionId] = null;

        }, 1000, 1);

    }

    // Checkbox tem um metodo especifico porque deve ser disparado assim que foi selecionado
    $scope.setCheckboxAnswer = function(questionId, answer){

        console.log($scope.promotion );

        promotionService.setAnswer($scope.promotion.id, questionId, auth.token, answer);

    }

    $scope.openPromotion = function(){

        var promises = [];

        if (auth.type == 1){ // Nao logado...

            $rootScope.description = $rootScope.i18.general.loginDescriptionMessage;
            $rootScope.originalDescription = $rootScope.description;

            $rootScope.callback = {func : function(args){
                $scope.userType = auth.type;
                startLoading();
            }, args : "args"};

            $ionicModal.fromTemplateUrl('templates/login.html', {
                scope: $rootScope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $rootScope.loginModal = modal;
                $rootScope.loginModal.show();
            });

        } else {
            $scope.promotionModal.show();
        }

    }

    $scope.openNewRequest = function(){


        if (auth.type == 1){ // Nao logado...
            $rootScope.description = $rootScope.i18.general.loginDescriptionMessage;
            $rootScope.originalDescription = $rootScope.description;

            $rootScope.callback = {func : function(args){
                $scope.userType = auth.type;
                startLoading();
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

    }

    var initStore = function(){

        var promisses = [];

        // Let's set a pretty high verbosity level, so that we see a lot of stuff
        // in the console (reassuring us that something is happening).
        store.verbosity = store.DEBUG;

        store.validator = function(product, callback) {

            console.log(product.transaction);

            loginService.validateSubscription(auth.token, product, function(result){

                if (result.success){
                    callback(true, {});
                } else if (result.messageCode == 'INVALID_SUBSCRIPTION_CONFIRMATION'){

                    console.log("A validacao do codigo " + product.transaction.id + " retornou a mensagem INVALID_DISCOUNT_CODE");
                    callback(false, {code: store.PURCHASE_EXPIRED, error: {message: "Código de subscrição inválido"}});

                } else if (result.messageCode == 'NOT_AN_SUBSCRIPTION_ATTEMPT'){
                    
                    callback(false, {code: store.PURCHASE_EXPIRED, error: {message: "Tentativa de subscrição sob reserva inválida ou já subscrito"}});
                    console.log("A validacao do codigo " + product.transaction.id + " retornou a mensagem NOT_AN_SUBSCRIPTION_ATTEMPT");
                
                } else if (result.messageCode == 'CANT_FIND_SUBSCRIPTION_ATTEMP'){
                    
                    callback(false, {code: store.PURCHASE_EXPIRED, error: {message: "Tentativa de subscrição sem reserva"}});
                    console.log("A validacao do codigo " + product.transaction.id + " retornou a mensagem CANT_FIND_SUBSCRIPTION_ATTEMP");

                }else {

                    callback(false, {});

                    alertPopup = $ionicPopup.alert({
                        title: "Ops!",
                        template: "Não conseguimos realizar sua assinatura! Que tal tentar novamente mais tarde?"
                    });

                    alertPopup.then(function(res) {
                        //$scope.shouldCreate = false;
                        $scope.modal.hide();
                    });

                }

            });

        };

        $rootScope.discount.beans.forEach(function (entry){

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
                  
                auth.type = 4; // USUARIO PREMIUM.
                auth.subscriptionCode = p.id;

                alertPopup = $ionicPopup.alert({
                    title: "Legal!",
                    template: "Sua assinatura da MultiSongs Premium está ativa. Agora você pode manter até 20 Playbacks Premium no seu celular."
                });

                alertPopup.then(function(res) {
                    $scope.modal.hide();
                });

                $rootScope.discount.code = null;

                p.finish();

            });

            store.when(entry.codigoNaLoja).unverified(function(p) {
                console.log("subscription unverified");
            });

            store.when(entry.codigoNaLoja).cancelled(function(p) {

                loginService.unsubscribe(auth.token, function(response){

                    console.log("A assinatura " + p.id + " foi cancelada na base de dados.");

                });

            });


            store.when(entry.codigoNaLoja).expired(function(p) {

                loginService.unsubscribe(auth.token, function(response){
                    console.log("A assinatura " + p.id + " foi cancelada na base de dados.");
                    if (auth.type == 4){ // Se usuario PREMIUM, se loga novamente
                        //startLoading();
                    }
                });

            });

            store.when(entry.codigoNaLoja).updated(function(p) {
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
            var product;

            if (auth.type == 4){ // Se o usuario esta logado, verifica se sua assinatura eh valida...

                product = store.get(auth.subscriptionCode); // Captura produto na loja

                if (!product || !product.owned) { // Se na loja o produto nao esta assinado....

                    console.log("A assinatura " + (product?product.id:"") + " eh NOT OWNED e na base de dados o usuario eh um assinante. Vai cancelar o servico...");

                    // CANCELAR ASSINATURA!!
                    loginService.unsubscribe(auth.token, function(response){
                        console.log("A assinatura " + (product?product.id:"") + " foi cancelada na base de dados.");
                        
                        //@TODO PRECISA COLOCAR ESSA LINHA DE VOLTA!!!!

                        //startLoading(); // Forca um novo login apos ter cancelado a assinatura para entrar com restricoes no app...
                    
                    });

                } else {
                    console.log("A assinatura " + product.id + " eh OWNED e na base de dados o usuario ja eh assinante. Nada a fazer");
                }

            } else {
                console.log("Na base de dados, o usuario nao eh assinante de nenhum servico. Nada a fazer");
            }





/*
          if ($stateParams.codigoNaLoja && $stateParams.codigoNaLoja != ''){ // So tenta realizar a compra se foi passado codigo de promocao como parametro da url
            store.order($stateParams.codigoNaLoja);
          }
*/
        });

        // After we've done our setup, we tell the store to do
        // it's first refresh. Nothing will happen if we do not call store.refresh()
        store.refresh();

    }
/*
    $scope.play = function(musicId){
        miniPlayer.play(musicId, miniPlayer.PLAYER_TYPE_MULTITRACK); // Carrega musica com player singletrack e download da musica remota
    }
*/
/*
    $scope.suspend = function(){
        miniPlayer.suspend();
    }

    $scope.resume = function(musicDetail){
        miniPlayer.resume(musicDetail);
    }

    $scope.verifyIfLoginIsNeededBeforeDownload = function(){
        miniPlayer.verifyIfLoginIsNeededBeforeDownload();
    }

    $scope.showLyrics = function(){
        miniPlayer.showLyrics();
    }

    $scope.showInstruments = function(){
        miniPlayer.showInstruments();
    }

    $scope.changeDisplayStatus = function(newStatus){
        miniPlayer.changeDisplayStatus(newStatus);
    }
*/
});

