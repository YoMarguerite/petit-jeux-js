var canvas, stage, af, hero, balls=[], explodeBalls=[], room, stats;

var COSMO = 'assets/cosmo.png',
    GUN = 'assets/revolver.png',
    FIRE = 'assets/fire.png',
    WALL = 'assets/wall2.png';


pixelCollision = ndgmr.checkPixelCollision;
rectCollision = ndgmr.checkRectCollision;

window.alphaThresh = 0.75;

function init() {
    // creating the canvas-element 
    canvas = document.createElement('canvas'); 
    canvas.width = getWidth(); 
    canvas.height = getHeight(); 
    document.body.appendChild(canvas); 
  
    // enlève le foue sur les images
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
   
    // initializing the stage 
    stage = new createjs.Stage(canvas);
   
    // creating a new HTMLImage
    af = new AssetFactory();
    af.onComplete = function() {
        imagesLoaded();
    }
    af.loadAssets([COSMO,GUN,FIRE,WALL]);
}

function initStats(){
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild( stats.domElement );
}

function initPerso(){
    var persoss = new createjs.SpriteSheet({
        images:[af[COSMO]],
        frames: {width:26, height:28, count:3, regX:13, regY:14}, 
        animations:{
            head:{frames:[0,1],speed:0.15}, 
            move:{frames:[0,2],speed:0.15}}
    });
  
    var perso = new createjs.Sprite(persoss);
    perso.gotoAndPlay('head');
    let scale = size(10, canvas.height, 28);
    perso.scaleX = scale;
    perso.scaleY = scale;
    perso.name = 'hero';

    perso.move = function(){
        if((upPress)||(downPress)||(leftPress)||(rightPress)){
            if(this.currentAnimation === 'head'){
                this.gotoAndStop('head');
                this.gotoAndPlay('move');
            }
        }else{
            if(this.currentAnimation === 'move'){
                this.gotoAndStop('move');
                this.gotoAndPlay('head');
            }
        }
    };
    return perso;
}

function initGun(perso){
    var gunss = new createjs.SpriteSheet({
        images:[af[GUN]],
        frames: {width:30,height:15,count:2,regX:4, regY:8},
        animations:{
            gun:0,
            shoot:1,
        }
    });

    var gun = new createjs.Sprite(gunss);
    gun.gotoAndPlay('gun');
    scale = size(25, perso.spriteSheet._frameWidth*perso.scaleY, 15);
    gun.y = 10;
    gun.scaleX = scale;
    gun.scaleY = scale;
    gun.lastShoot = 0;
    gun.name ='gun';
    gun.move = function(){
        let point = {
            adjacent:Math.sqrt(Math.pow(stage.mouseX-this.parent.x,2)),
            hypothenuse:Math.sqrt(Math.pow(stage.mouseX-this.parent.x,2)+Math.pow(stage.mouseY-this.parent.y,2))
        };
        this.rotation = Math.sign(this.scaleX)*Math.sign(stage.mouseY-this.parent.y)
    *Math.acos(point.adjacent/point.hypothenuse)*180/Math.PI;
    
        let tick = createjs.Ticker.getTime();
        if(tick>(this.lastShoot+250)){
            if(this.currentAnimation === 'shoot'){
                this.gotoAndStop('shoot');
                this.gotoAndPlay('gun');
            }
        }
        if(boolDown){
            if(tick>(this.lastShoot+750)){
                this.lastShoot = tick;
                if(this.currentAnimation === 'gun'){
                    this.gotoAndStop('gun');
                    this.gotoAndPlay('shoot');
                }
                initBall(this);
            }
        }
    };
    return gun;
}

function initHero(){
    
    var perso = initPerso();
    var gun = initGun(perso);

    var cont = new createjs.Container();
    cont.addChild(perso);
    cont.addChild(gun);
    cont.x = canvas.width/2;
    cont.y = canvas.height/2;
    
    cont.move = function(){
        this.scaleX = stage.mouseX < this.x ? -this.scaleY : this.scaleY;
        this.children.forEach((child) => {
            child.move();
        })
    };

    stage.addChild(cont);
    hero = cont;
}

function initBall(gun){
    let ballss = new createjs.SpriteSheet({
        images:[af[FIRE]],
        frames: {width:22,height:20,count:6,regX:11, regY:10},
        animations:{
            shoot:0,
            explode:{frames:[1,2,3,4,5],speed:0.2,next:false}
        }
    });
    let ball = new createjs.Sprite(ballss);
    
    ball.scaleX = Math.sign(hero.scaleX)*gun.scaleX;
    ball.scaleY = gun.scaleY;

    ball.rotation = Math.sign(hero.scaleX)*hero.children[1].rotation;

    let dx = stage.mouseX-hero.x;
    let dy = stage.mouseY-hero.y;
    let divise = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));

    ball.velX = dx/divise;
    ball.velY = dy/divise;

    ball.x = hero.x-room._matrix.tx//+(ball.velX*22*ball.scaleX);
    ball.y = hero.y-room._matrix.ty//+(ball.velY*5*ball.scaleY);

    ball.speed = 20;
    ball.gotoAndPlay('shoot');
    ball.move = function(){
        this.x += this.velX*this.speed;
        this.y += this.velY*this.speed;
    }
    stage.addChild(ball);
    balls.push(ball);
    room.addChild(ball);
}

function initRoom(){
    let wall = new createjs.Bitmap(af[WALL]);
    wall.name='wall';
    wall.scaleX = 3;
    wall.scaleY = 3;
    wall.regX = wall.image.width/2;
    wall.regY = wall.image.height/2;

    room = new createjs.Container();
    room.addChild(wall);
    room.x = canvas.width/2;
    room.y = canvas.height/2;
    room.regX = wall.image.width / 2;
    room.regY = wall.image.height / 2;
    room.velX = 5;
    room.velY = 5;
    room.move = function() {
        let clone = this.clone(true);
          if(upPress){
            clone.y += this.velY;
            if(!pixelCollision(clone.getChildByName('wall'),hero.getChildByName('hero'),window.alphaThresh)) {
              this.y+=this.velY;
            }
          }
          if(downPress){
            clone.y-=this.velY;
            if(!pixelCollision(clone.getChildByName('wall'),hero.getChildByName('hero'),window.alphaThresh)) {
              this.y-=this.velY;
            }
          }
          if(leftPress){
            clone.x+=this.velX;
            if(!pixelCollision(clone.getChildByName('wall'),hero.getChildByName('hero'),window.alphaThresh)) {
              this.x+=this.velX;
            }
          }
          if(rightPress){
            clone.x-=this.velX;
            if(!pixelCollision(clone.getChildByName('wall'),hero.getChildByName('hero'),window.alphaThresh)) {
              this.x-=this.velX;
            }
          }
    };

    stage.addChild(room);
}

// creating a Bitmap with that image 
// and adding the Bitmap to the stage 
function imagesLoaded(e) {
    initStats();
    initHero();
    initRoom();

    // set the Ticker to 30fps 
    createjs.Ticker.setFPS(30); 
    createjs.Ticker.addEventListener('tick', this.onTick.bind(this)); 
}

// update the stage every frame 
function onTick(e) {
    stats.begin();
    hero.move();
    room.move();

    balls = balls.filter((ball) => {
        ball.move();
        if(!pixelCollision(ball,room.getChildByName('wall'),window.alphaThresh)){
            return ball;
        }
        ball.gotoAndStop('shoot');
        ball.gotoAndPlay('explode');
        explodeBalls.push(ball);
    });

    explodeBalls = explodeBalls.filter((ball) => {
        if(ball.currentAnimationFrame > 4){
            stage.removeChild(ball);
        }else{
            return ball;
        }
    });
   
    stage.update();
  
    stats.end();
}

function size(factor, ref, size){
    let percent = ref/100
    return factor*(percent/size);
}

function getWidth() {
    if( typeof( window.innerWidth ) == 'number' ) {
        return window.innerWidth;
    } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
        return document.documentElement.clientWidth;
    } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
        return document.body.clientWidth;
    }
}

function getHeight() {
    if( typeof( window.innerWidth ) == 'number' ) {
        return window.innerHeight;
    } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
        return document.documentElement.clientHeight;
    } else if( document.body && ( document.body.clientHeight || document.body.clientHeight ) ) {
        return document.body.clientHeight;
    }
}


window.onload = init;