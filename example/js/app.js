var canvas, stage, af, stars=[], hero, shelter, stats;

var STARS = 'assets/stars.png?v=4',
    STAR = 'assets/star.png?v=4',
    SHELTER = 'assets/shelter.png?v=4',
    COSMO = 'assets/cosmo.png';

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

  //définie les éléments liés au canvas
  canvas.onmousedown = onMouseDown;
  canvas.onmouseup = onMouseUp;
  document.onkeydown = keyDown;
  document.onkeyup = keyUp;

   
  // initializing the stage 
  stage = new createjs.Stage(canvas);
   
  // creating a new HTMLImage
  af = new AssetFactory();
  af.onComplete = function() {
     imagesLoaded();
  }
  af.loadAssets([STAR,STARS,SHELTER,COSMO]);
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
     stage.addChild(star);
     stars.push(star);
  }

  var persoss = new createjs.SpriteSheet({images:[af[COSMO]],frames: {width:26, height:28, count:2, regX:13, regY:14}, animations:{move:[0,1]}});
  var perso = new createjs.Sprite(persoss);
  perso.spriteSheet.getAnimation('move').speed = 0.25;
  perso.gotoAndPlay('move');
  perso.x = 200;
  perso.y = 100;
  perso.scaleX = -5;
  perso.scaleY = 5;
  stage.addChild(perso);
  hero = perso;

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
      star.y += star.velY;
      star.rotation += star.rotVel;
      
      var intersection = pixelCollision(shelter,star,window.alphaThresh);
      if ( intersection ) {
         //console.log(intersection.x,intersection.y,intersection.width,intersection.height);
         star.y = -15 - Math.random()*15;
         star.x = Math.random()*canvas.width;
      }
      if ( star.y > canvas.height ) {
        star.y = -15 - Math.random()*15;
        star.x = Math.random()*canvas.width;
      }
   }
   if(stage.mouseX < hero.x){
    hero.scaleX = -5;
   }else{
    hero.scaleX = 5;
   }
   if(upPress){
     hero.y-=1;
   }
   if(downPress){
     hero.y+=1;
   }
   if(leftPress){
     hero.x-=1;
   }
   if(rightPress){
     hero.x+=1;
   }
  stage.update();
  //shelter.x = stage.mouseX;
  //shelter.y = stage.mouseY;
  
  stats.end();
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

// function liées aux évènements de la page
var boolDown, upPress, downPress, leftPress, rightPress;
boolDown = upPress = downPress = leftPress = rightPress = false;

function onMouseDown(e) {
  boolDown = true;
}

function onMouseUp(e) {
  boolDown = false;
}

function keyDown(e){
  if(e.key == "Right" || e.key == "ArrowRight") {
    rightPress = true;
  }
  else if(e.key == "Left" || e.key == "ArrowLeft") {
    leftPress = true;
  }else if(e.key == "Up" || e.key == "ArrowUp") {
    upPress = true;
  }else if(e.key == "Down" || e.key == "ArrowDown") {
    downPress = true;
  }
}

function keyUp(e){
  if(e.key == "Right" || e.key == "ArrowRight") {
    rightPress = false;
  }
  else if(e.key == "Left" || e.key == "ArrowLeft") {
    leftPress = false;
  }else if(e.key == "Up" || e.key == "ArrowUp") {
    upPress = false;
  }else if(e.key == "Down" || e.key == "ArrowDown") {
    downPress = false;
  }
}

window.onload = init;