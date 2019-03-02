function CMain(oData){
    var _bUpdate;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    
    var _oData;
    var _oPreloader;
    var _oMenu;
    var _oHelp;
    var _oGame;

    this.initContainer = function(){
        var canvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(canvas);       
        createjs.Touch.enable(s_oStage);
        
        s_bMobile = jQuery.browser.mobile;
        if(s_bMobile === false){
            s_oStage.enableMouseOver(20);  
        }
        
        
        s_iPrevTime = new Date().getTime();

        createjs.Ticker.setFPS(FPS);
	createjs.Ticker.addEventListener("tick", this._update);
		
        if(navigator.userAgent.match(/Windows Phone/i)){
                DISABLE_SOUND_MOBILE = true;
        }
		
        s_oSpriteLibrary  = new CSpriteLibrary();

        //ADD PRELOADER
        _oPreloader = new CPreloader();
    };

    this.soundLoaded = function(){
         _iCurResource++;

         if(_iCurResource === RESOURCE_TO_LOAD){
            _oPreloader.unload();
            
            this.gotoMenu();
         }
    };
    
    this._initSounds = function(){
        var aSoundsInfo = new Array();
        aSoundsInfo.push({path: '/game/sounds/',filename:'chip',loop:false,volume:1, ingamename: 'chip'});
        aSoundsInfo.push({path: '/game/sounds/',filename:'click',loop:false,volume:1, ingamename: 'click'});
        aSoundsInfo.push({path: '/game/sounds/',filename:'fiche_collect',loop:false,volume:1, ingamename: 'fiche_collect'});
        aSoundsInfo.push({path: '/game/sounds/',filename:'wheel_sound',loop:true,volume:1, ingamename: 'wheel_sound'});
        aSoundsInfo.push({path: '/game/sounds/',filename:'win',loop:false,volume:1, ingamename: 'win'});
        aSoundsInfo.push({path: '/game/sounds/',filename:'lose',loop:false,volume:1, ingamename: 'lose'});
        
        RESOURCE_TO_LOAD += aSoundsInfo.length;

        s_aSounds = new Array();
        for(var i=0; i<aSoundsInfo.length; i++){
            s_aSounds[aSoundsInfo[i].ingamename] = new Howl({ 
                                                            src: [aSoundsInfo[i].path+aSoundsInfo[i].filename+'.mp3', aSoundsInfo[i].path+aSoundsInfo[i].filename+'.ogg'],
                                                            autoplay: false,
                                                            preload: true,
                                                            loop: aSoundsInfo[i].loop, 
                                                            volume: aSoundsInfo[i].volume,
                                                            onload: s_oMain.soundLoaded()
                                                        });
        }
        
    };  
    
    this._loadImages = function(){
        s_oSpriteLibrary.init( this._onImagesLoaded,this._onAllImagesLoaded, this );

	s_oSpriteLibrary.addSprite("bg_menu","/game/sprites/bg_menu.jpg");
        s_oSpriteLibrary.addSprite("but_exit","/game/sprites/but_exit.png");
        s_oSpriteLibrary.addSprite("bg_game","/game/sprites/bg_game.jpg");
        s_oSpriteLibrary.addSprite("audio_icon","/game/sprites/audio_icon.png");
        s_oSpriteLibrary.addSprite("msg_box","/game/sprites/msg_box.png");
        s_oSpriteLibrary.addSprite("hit_area_0","/game/sprites/hit_area_0.png");
        s_oSpriteLibrary.addSprite("hit_area_color","/game/sprites/hit_area_color.png");
        s_oSpriteLibrary.addSprite("hit_area_horizontal","/game/sprites/hit_area_horizontal.png");
        s_oSpriteLibrary.addSprite("hit_area_number","/game/sprites/hit_area_number.png");
        s_oSpriteLibrary.addSprite("hit_area_couple_horizontal","/game/sprites/hit_area_couple_horizontal.png");
        s_oSpriteLibrary.addSprite("hit_area_couple_vertical","/game/sprites/hit_area_couple_vertical.png");
        s_oSpriteLibrary.addSprite("hit_area_small","/game/sprites/hit_area_small.png");
        s_oSpriteLibrary.addSprite("hit_area_horizontal_half","/game/sprites/hit_area_horizontal_half.png");
        s_oSpriteLibrary.addSprite("chip_box","/game/sprites/chip_box.png");
        s_oSpriteLibrary.addSprite("but_bets","/game/sprites/but_bets.png");
        s_oSpriteLibrary.addSprite("but_bg","/game/sprites/but_bg.png");
        s_oSpriteLibrary.addSprite("but_clear_all","/game/sprites/but_clear_all.png");
        s_oSpriteLibrary.addSprite("but_clear_last","/game/sprites/but_clear_last.png");
        s_oSpriteLibrary.addSprite("but_rebet","/game/sprites/but_rebet.png");
        s_oSpriteLibrary.addSprite("but_play","/game/sprites/but_play.png");
        s_oSpriteLibrary.addSprite("logo_credits","/game/sprites/logo_credits.png");
        s_oSpriteLibrary.addSprite("but_credits","/game/sprites/but_credits.png");
        s_oSpriteLibrary.addSprite("history_bg","/game/sprites/history_bg.png");
        s_oSpriteLibrary.addSprite("show_number_panel","/game/sprites/show_number_panel.png");
        s_oSpriteLibrary.addSprite("show_number_bg","/game/sprites/show_number_bg.png");
        s_oSpriteLibrary.addSprite("ball","/game/sprites/ball.png");
        s_oSpriteLibrary.addSprite("enlight_0","/game/sprites/enlight_0.png");
        s_oSpriteLibrary.addSprite("enlight_color","/game/sprites/enlight_color.png");
        s_oSpriteLibrary.addSprite("enlight_horizontal","/game/sprites/enlight_horizontal.png");
        s_oSpriteLibrary.addSprite("enlight_number","/game/sprites/enlight_number.png");
        s_oSpriteLibrary.addSprite("enlight_horizontal_half","/game/sprites/enlight_horizontal_half.png");
        s_oSpriteLibrary.addSprite("select_fiche","/game/sprites/select_fiche.png");
        s_oSpriteLibrary.addSprite("spin_but","/game/sprites/spin_but.png");
        s_oSpriteLibrary.addSprite("placeholder","/game/sprites/placeholder.png");
        s_oSpriteLibrary.addSprite("circle_red","/game/sprites/circle_red.png");
        s_oSpriteLibrary.addSprite("circle_green","/game/sprites/circle_green.png");
        s_oSpriteLibrary.addSprite("circle_black","/game/sprites/circle_black.png");
        s_oSpriteLibrary.addSprite("final_bet_bg","/game/sprites/final_bet_bg.png");
        s_oSpriteLibrary.addSprite("neighbor_bg","/game/sprites/neighbor_bg.jpg");
        s_oSpriteLibrary.addSprite("neighbor_enlight","/game/sprites/neighbor_enlight.png");
        s_oSpriteLibrary.addSprite("hitarea_neighbor","/game/sprites/hitarea_neighbor.png");
        s_oSpriteLibrary.addSprite("bg_wheel","/game/sprites/bg_wheel.jpg");
        s_oSpriteLibrary.addSprite("logo_game_0","/game/sprites/logo_game_0.png");
        s_oSpriteLibrary.addSprite("but_fullscreen","/game/sprites/but_fullscreen.png");
        
        s_oSpriteLibrary.addSprite("board_roulette","/game/sprites/board_roulette.jpg");
        
        for(var i=0;i<NUM_FICHES;i++){
            s_oSpriteLibrary.addSprite("fiche_"+i,"/game/sprites/fiche_"+i+".png");
        }
        
        for(var j=0;j<NUM_MASK_BALL_SPIN_FRAMES;j++){
            s_oSpriteLibrary.addSprite("wheel_handle_"+j,"/game/sprites/mask_ball_spin/wheel_handle_"+j+".png");
        }
        
        for(var t=0;t<NUM_MASK_BALL_SPIN_FRAMES;t++){
            s_oSpriteLibrary.addSprite("wheel_numbers_"+t,"/game/sprites/wheel_anim/wheel_numbers_"+t+".png");
        }
        
        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();

        s_oSpriteLibrary.loadSprites();
    };
    
    this._onImagesLoaded = function(){
        console.log('_onImagesLoaded');
        _iCurResource++;

        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);

        _oPreloader.refreshLoader(iPerc);
        
        if(_iCurResource === RESOURCE_TO_LOAD){
            _oPreloader.unload();
            
            this.gotoMenu();
        }
    };
    
    this._onAllImagesLoaded = function(){
        
    };
    
    this.onImageLoadError = function(szText){
        
    };
	
    this.preloaderReady = function(){
        this._loadImages();
		
	if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            this._initSounds();
        }
        
        _bUpdate = true;
    };
    
    this.gotoMenu = function(){
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    };
    
    this.gotoGame = function(){
        _oGame = new CGame(_oData);   
							
        _iState = STATE_GAME;
    };
    
    this.gotoHelp = function(){
        _oHelp = new CHelp();
        _iState = STATE_HELP;
    };
    
    this.stopUpdate = function(){
        _bUpdate = false;
        createjs.Ticker.paused = true;
        $("#block_game").css("display","block");
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            Howler.mute(true);
        }
        
    };

    this.startUpdate = function(){
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false;
        $("#block_game").css("display","none");
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            if(s_bAudioActive){
                Howler.mute(false);
            }
        }
        
    };
    
    this._update = function(event){
        if(_bUpdate === false){
                return;
        }
        var iCurTime = new Date().getTime();
        s_iTimeElaps = iCurTime - s_iPrevTime;
        s_iCntTime += s_iTimeElaps;
        s_iCntFps++;
        s_iPrevTime = iCurTime;
        
        if ( s_iCntTime >= 1000 ){
            s_iCurFps = s_iCntFps;
            s_iCntTime-=1000;
            s_iCntFps = 0;
        }
                
        if(_iState === STATE_GAME){
            _oGame.update();
        }
        
        s_oStage.update(event);

    };
    
    s_oMain = this;
    _oData = oData;
    ENABLE_FULLSCREEN = oData.fullscreen;
    ENABLE_CHECK_ORIENTATION = oData.check_orientation;
    SHOW_CREDITS = _oData.show_credits;

    this.initContainer();
}

var s_bMobile;
var s_bAudioActive = true;
var s_bFullscreen = false;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;

var s_oDrawLayer;
var s_oStage;
var s_oMain = null;
var s_oSpriteLibrary;
var s_aSounds;