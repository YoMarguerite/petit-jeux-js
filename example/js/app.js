var canvas, stage, af, stars=[], hero, balls=[], shelter, stats;

var STARS = 'assets/stars.png?v=4',
    STAR = 'assets/star.png?v=4',
    SHELTER = 'assets/shelter.png?v=4',
    COSMO = 'assets/cosmo.png',
    GUN = 'assets/revolver.png',
    FIRE = 'assets/fire.png';


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
  af.loadAssets([STAR,STARS,SHELTER,COSMO,GUN,FIRE]);
}
 
// creating a Bitmap with that image 
// and adding the Bitmap to the stage 
function imagesLoaded(e) {
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild( stats.domElement );
  var ss = new createjs.SpriteSheet({images:[af[STARS]],frames: {width:30, height:22, count:4, regX: 0, regY:0}, animations:{blink:[0,3]}});
  for ( var c = 0; c < 100; c++ ) {
     if ( Math.random() < 0.2 ) {
        var star = new createjs.Sprite(ss);
        star.spriteSheet.getAnimation('blink').speed = 1/((Math.random()*3+3)|0);
        star.gotoAndPlay('blink');
        if( Math.random() < 0.5 ) star.advance();
     } else {
        star = new createjs.Bitmap(af[STAR]);
        if ( Math.random() < 0.66 ) {
          star.sourceRect = new createjs.Rectangle(0,0,star.image.width/2,star.image.height/2);
        } else if ( Math.random() < 0.33 ) {
          star.sourceRect = new createjs.Rectangle(0,0,star.image.width/2,star.image.height);
        }
     }
     star.x = Math.random()*canvas.width;
     star.y = Math.random()*canvas.height;
     star.regX = 25;
     star.regY = 25;
     star.velY = Math.random()*1.5+1;
     star.rotVel = Math.random()*4-2;
     star.scaleX = star.scaleY = Math.random()*.5+.5;
     star.rotation = Math.random() * 360;

     star.move = function(){
       this.y+=this.velY;
       this.rotatio += this.rotVel;
     }

     star.reset = function(){
      this.y = -15 - Math.random()*15;
      this.x = Math.random()*canvas.width;
     }

     stage.addChild(star);
     stars.push(star);
  }

  var persoss = new createjs.SpriteSheet({
    images:[af[COSMO]],
    frames: {width:26, height:28, count:3, regX:13, regY:14}, 
    animations:{
      head:{frames:[0,1],speed:0.25}, 
      move:{frames:[0,2],speed:0.25}}
  });
  
  var perso = new createjs.Sprite(persoss);
  perso.gotoAndPlay('head');
  let scale = size(10, canvas.height, 28);
  perso.scaleX = scale;
  perso.scaleY = scale;

  perso.move = function(){
    if((upPress)||(downPress)||(leftPress)||(rightPress)){
      if(this._animation.name === 'head'){
        this.gotoAndStop('head');
        this.gotoAndPlay('move');
      }
    }else{
      if(this._animation.name === 'move'){
        this.gotoAndStop('move');
        this.gotoAndPlay('head');
      }
    }
  };

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
  gun.move = function(){
    let point = {
      adjacent:Math.sqrt(Math.pow(stage.mouseX-this.parent.x,2)),
      hypothenuse:Math.sqrt(Math.pow(stage.mouseX-this.parent.x,2)+Math.pow(stage.mouseY-this.parent.y,2))
    };
    this.rotation = Math.sign(this.scaleX)*Math.sign(stage.mouseY-this.parent.y)
    *Math.acos(point.adjacent/point.hypothenuse)*180/Math.PI;
    
    let tick = createjs.Ticker.getTime();
    if(tick>(this.lastShoot+250)){
      if(this._animation.name === 'shoot'){
        this.gotoAndStop('shoot');
        this.gotoAndPlay('gun');
      }
    }
    if(boolDown){
      if(tick>(this.lastShoot+1000)){
        this.lastShoot = tick;
        if(this._animation.name === 'gun'){
          this.gotoAndStop('gun');
          this.gotoAndPlay('shoot');
        }
        let ball = new createjs.Bitmap(af[FIRE]);
        ball.x = hero.x;
        ball.y = hero.y;
        ball.scaleX = Math.sign(hero.scaleX)*this.scaleX;
        ball.scaleY = this.scaleY;
        ball.rotation = Math.sign(hero.scaleX)*hero.children[1].rotation;
        let dx = stage.mouseX-ball.x;
        var dy = stage.mouseY-ball.y;
        var divise = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
        ball.velX = dx/divise;
        ball.velY = dy/divise;
        ball.speed = 5;
        ball.move = function(){
          this.x += this.velX*5;
          this.y += this.velY*5; 
        }
        stage.addChild(ball);
        balls.push(ball);
      }
    }
  };

  var cont = new createjs.Container();
  cont.addChild(perso);
  cont.addChild(gun);
  cont.x = 200;
  cont.y = 100;
  cont.velX = 5;
  cont.velY = 5;
  cont.move = function(){
    this.scaleX = stage.mouseX < this.x ? -this.scaleY : this.scaleY;
    if(upPress){
      this.y-=this.velY;
    }
    if(downPress){
      this.y+=this.velY;
    }
    if(leftPress){
      this.x-=this.velX;
    }
    if(rightPress){
      this.x+=this.velX;
    }
    this.children.forEach((child) => {
      child.move();
    })
  };

  stage.addChild(cont);
  hero = cont;

  shelter = new createjs.Bitmap(af[SHELTER]);
  shelter.x = canvas.width/2;
  shelter.y = canvas.height/1.5;
  shelter.regX = shelter.image.width / 2;
  shelter.regY = shelter.image.height / 2;
  stage.addChild(shelter);

  // set the Ticker to 30fps 
  createjs.Ticker.setFPS(30); 
  createjs.Ticker.addEventListener('tick', this.onTick.bind(this)); 
}
 
// update the stage every frame 
function onTick(e) {
   stats.begin();
   for ( var c = 0; c < stars.length; c++ ) {
      var star = stars[c];
      star.move();
      
      var intersection = pixelCollision(shelter,star,window.alphaThresh);
      if (intersection) {
         star.reset();
      }
      if ( star.y > canvas.height ) {
        star.reset();
      }
   }
   hero.move();

   balls.forEach((ball) => {
     ball.move();
   })
   
  stage.update();
  //shelter.x = stage.mouseX;
  //shelter.y = stage.mouseY;
  
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