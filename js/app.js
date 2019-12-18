var canvas, stage, af, hero, heroes=[], enemies=[], balls=[], eballs=[], explodeBalls=[], boxs=[], room, stats, scale;

var COSMO = 'assets/cosmo.png',
    GUN = 'assets/revolver.png',
    FIRE = 'assets/fire.png',
    GOBELIN = 'assets/gobelin.png',
    BLOCK = 'assets/block.png',
    WALL = 'assets/wall3.png',
    GROUND = 'assets/ground.png',
    BOX = 'assets/box.png';


pixelCollision = ndgmr.checkPixelCollision;
rectCollision = ndgmr.checkRectCollision;

window.alphaThresh = 0.999;

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
    af.loadAssets([COSMO,GUN,FIRE,GOBELIN,WALL,GROUND,BOX,BLOCK]);
}

function initStats(){
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild( stats.domElement );
}

function createPersoSS(images,x,y){
    let ss = new createjs.SpriteSheet({
        images:images,
        frames: {width:x, height:y, count:5, regX:x/2, regY:y/2}, 
        animations:{
            head:{frames:[0,1],speed:0.15}, 
            move:{frames:[0,2],speed:0.15},
            damage:{frames:[3],next:false},
            dead:{frames:[4], next:false}
        }
    });
    return ss;
}

function initPerso(){

    var perso = new createjs.Sprite(createPersoSS([af[COSMO]],24,26));
    perso.gotoAndPlay('head');

    scale = size(10, canvas.height, 28);
    perso.scaleX = scale;
    perso.scaleY = scale;

    perso.name = 'hero';

    perso.move = function(){
        if(createjs.Ticker.getTime()>this.lastShoot+250 && this.currentAnimation==='damage'){
            this.gotoAndPlay('head');
        }
        if((upPress)||(downPress)||(leftPress)||(rightPress)){
            if(this.currentAnimation === 'head'){
                this.gotoAndPlay('move');
            }
        }else{
            if(this.currentAnimation === 'move'){
                this.gotoAndPlay('head');
            }
        }
    };

    perso.takeDamage = function(life){
        if(life === 0){
            this.gotoAndPlay('dead');
        }else{
            this.lastShoot = createjs.Ticker.getTime();
            this.gotoAndPlay('damage');
        }
    };

    return perso;
}

function initGun(perso){
    var gunss = new createjs.SpriteSheet({
        images:[af[GUN]],
        frames: {width:30,height:15,count:2,regX:4, regY:8},
        animations:{
            gun:{frames:[0],next:false},
            shoot:{frames:[1],next:false},
        }
    });

    var gun = new createjs.Sprite(gunss);
    gun.gotoAndPlay('gun');
    let gunsize = size(25, perso.spriteSheet._frameHeight*perso.scaleY, 15);
    gun.scaleX = gunsize;
    gun.scaleY = gunsize;
    gun.lastShoot = 0;
    gun.name ='gun';
    
    return gun;
}

function initHero(){
    
    var perso = initPerso();
    console.log(perso);
    var gun = initGun(perso);
    gun.y = 10;
    gun.move = function(){
        let x = stage.mouseX-this.parent.x;
        let y = stage.mouseY-this.parent.y;
        this.rotation = Math.sign(y)*rotation(x,y);
    
        let tick = createjs.Ticker.getTime();
        if(tick>(this.lastShoot+250)){
            if(this.currentAnimation === 'shoot'){
                this.gotoAndPlay('gun');
            }
        }
        if(boolDown){
            if(tick>(this.lastShoot+750)){
                this.lastShoot = tick;
                if(this.currentAnimation === 'gun'){
                    this.gotoAndPlay('shoot');
                }
                
                let coef = Math.sign(this.parent.scaleX);
                let ball = initBall(this.parent.x-room._matrix.tx,this.parent.y-room._matrix.ty,
                    coef*this.scaleX,this.scaleY, coef*this.rotation,
                    stage.mouseX-this.parent.x,stage.mouseY-this.parent.y,20);
                balls.push(ball);
                room.addChild(ball);
            }
        }
    };

    var cont = new createjs.Container();
    //cont.addChild(new createjs.Bitmap(af[BLOCK]));
    cont.addChild(perso);
    cont.addChild(gun);

    cont.x = canvas.width/2;
    cont.y = canvas.height/2;
    cont.life = 5;
    
    cont.move = function(){
        this.scaleX = stage.mouseX < this.x ? -this.scaleY : this.scaleY;
        this.children.forEach((child) => {
            child.move();
        });
        room.move();
    };

    cont.takeDamage = function(damage){
        this.life -= damage;
        if(this.life <= 0){
            this.life = 0;
            let index = heroes.indexOf(this);
            heroes.splice(index,1);
            this.removeChild(this.children[1]);
        }
        this.children[0].takeDamage(this.life);
    };

    stage.addChild(cont);
    heroes.push(cont);
    hero = cont;
}

function initBall(x,y,scaleX,scaleY,rotation,dx,dy,speed=20,damage = 1){
    let ballss = new createjs.SpriteSheet({
        images:[af[FIRE]],
        frames: {width:22,height:20,count:6,regX:11, regY:10},
        animations:{
            shoot:{frames:[0],next:false},
            explode:{frames:[1,2,3,4,5],speed:0.5,next:false}
        }
    });
    let ball = new createjs.Sprite(ballss);

    
    ball.x = x;
    ball.y = y;
    ball.scaleX = scaleX;
    ball.scaleY = scaleY;
    ball.rotation = rotation;

    let divise = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
    ball.velX = dx/divise;
    ball.velY = dy/divise;
    ball.speed = speed;
    ball.damage = damage;
    ball.gotoAndPlay('shoot');
    ball.move = function(){
        this.x += this.velX*this.speed;
        this.y += this.velY*this.speed;
    }
    //createjs.Ticker.removeAllEventListeners();
    return ball;    
}

function initGobelin(){

    var gobelin = new createjs.Sprite(createPersoSS([af[GOBELIN]],18,26));
    gobelin.gotoAndPlay('move');
    gobelin.lastShoot = 0;
    gobelin.lastMove = 0;

    gobelin.takeDamage = function(life){
        if(life === 0){
            this.gotoAndPlay('dead');
        }else{
            this.lastShoot = createjs.Ticker.getTime();
            this.gotoAndPlay('damage');
        }
    };

    gobelin.move = function(){
        if(createjs.Ticker.getTime()>this.lastShoot+250&&this.currentAnimation==='damage'){
            this.gotoAndPlay('head');
        }
    };
    
    return gobelin;
}

function initEnemie(){

    let gobelin = initGobelin();
    let gun = initGun(gobelin);
    gun.y = 4;
    gun.lastShoot = createjs.Ticker.getTime();
    gun.nextShoot = gun.lastShoot+((Math.random()*5)+5)*1000;
    gun.move = function(){
        let x = hero.x-(room.x-(this.parent.regX*this.parent.scaleX)+this.parent.x);
        let y = hero.y-(room.y-(this.parent.regY*this.parent.scaleY)+this.parent.y);
        this.rotation = Math.sign(x*y)*rotation(x,y);
    
        let tick = createjs.Ticker.getTime();
        if(tick>(this.lastShoot+250)){
            if(this.currentAnimation === 'shoot'){
                this.gotoAndPlay('gun');
            }
        }
        if(tick>this.nextShoot){
            this.lastShoot = tick;
            this.nextShoot = tick+((Math.random()*2)+3)*1000;
            if(this.currentAnimation === 'gun'){
                this.gotoAndPlay('shoot');
            }
            let coef = Math.sign(this.parent.scaleX);
            let ball = initBall((this.parent.x-this.parent.regX*scale),(this.parent.y-this.parent.regY*scale),
                this.scaleX*this.parent.scaleX,this.scaleY*this.parent.scaleY, coef*this.rotation,
                x,y,10);
            eballs.push(ball);
            room.addChild(ball);
        }
    };

    let cont = new createjs.Container();
    cont.addChild(gobelin);
    cont.addChild(gun);

    cont.x = ((Math.random()*15)+1)*scale*15;
    cont.y = ((Math.random()*21)+1)*scale*15;
    cont.velX = 0;
    cont.velY = 0;
    cont.life = 5;
    cont.speed = 3;
    cont.lastMove = 0;
    cont.lapsMove = 0;
    cont.move = function(){
        let coef = Math.sign(hero.x-(room.x-(this.regX*this.scaleX)+this.x));
        this.children.forEach((child) => {
            child.scaleX = coef*child.scaleY;
            child.move();
        });


        let time = createjs.Ticker.getTime();
        let sprite = this.children[0];
        if(time>this.lastMove&&time<this.lastMove+this.lapsMove){  

            let wall = room.getChildByName('wall');

            if(sprite.currentAnimation!='move'){
                sprite.gotoAndPlay('move');
            }    

            this.x+=this.velX;            
            if(collisionSprite(boxs,sprite)||collision(wall,sprite)){
                this.x-=this.velX;
            }
            
            this.y+=this.velY;            
            if(collisionSprite(boxs,sprite)||collision(wall,sprite)){
                this.y-=this.velY;
            }
        }
        if(time>this.lastMove+this.lapsMove){
            if(sprite.currentAnimation!='head'){
                sprite.gotoAndPlay('head');
                this.lastMove = time+(Math.random()*3+1)*1000;
                this.lapsMove = (Math.random()*3+1)*1000;
                let dx = Math.floor(hero.x-(room.x-this.regX*scale+this.x));
                let dy = Math.floor(hero.y-(room.y-this.regY*scale+this.y));
                let divise = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
                this.velX = dx/divise*this.speed;
                this.velY = dy/divise*this.speed;
            } 
        }
    };

    cont.takeDamage = function(damage){
        this.life -= damage;
        if(this.life <= 0){
            this.life = 0;
            let index = enemies.indexOf(this);
            enemies.splice(index,1);
            this.removeChild(this.children[1]);
            room.setChildIndex(this,14);
        }
        this.children[0].takeDamage(this.life);
    };

    room.addChild(cont);
    enemies.push(cont);
}

function initRoom(){

    let ground = new createjs.Bitmap(af[GROUND]);
    ground.name='ground';
    let wall = new createjs.Bitmap(af[WALL]);
    wall.name='wall';
      
    room = new createjs.Container();

    room.addChild(ground);
    room.addChild(wall);  
    
    room.x = canvas.width/2;
    room.y = canvas.height/2;
    room.velX = 5;
    room.velY = 5;
    room.move = function() {

        let ref = hero.getChildByName('hero'),
            wall = this.getChildByName('wall'),
            x=0,y=0;

        if(upPress){
            y+=this.velY;
        }
        if(downPress){
            y-=this.velY;
        }
        if(leftPress){
            x+=this.velX;
        }
        if(rightPress){
            x-=this.velX;
        }
        
        this.x += x;
        if(collision(wall,ref)||(collisionSprite(boxs,ref))){
            this.x -= x;
        }
        this.y += y;
        if(collision(wall,ref)||(collisionSprite(boxs,ref))){
            this.y -= y;
        }
    };

    stage.addChild(room);
}

function initBlock(x,y){
    let block = new createjs.Bitmap(af[BLOCK]);
    block.x = x;
    block.y = y;
    room.addChild(block);
    boxs.push(block);
}

function initBox(x,y){
    let boxss = new createjs.SpriteSheet({
        images:[af[BOX]],
        frames: {width:15,height:15,count:4},
        animations:{
            four:0,
            three:1,
            two:2,
            one:3
        }
    });
    let box = new createjs.Sprite(boxss);
    box.gotoAndPlay('four');
    box.name='box';
    box.x = x;
    box.y = y;
    box.life = 3;
    box.tabAnim = ['one','two','three','four'];
    box.takeDamage = function(damage){
        this.life -= damage;
        if(this.life <= 0){
            this.life = 0;
            let index = boxs.indexOf(this);
            boxs.splice(index,1);
        }
        this.gotoAndPlay(this.tabAnim[this.life]);
    };
    room.addChild(box);
    boxs.push(box);
}


// creating a Bitmap with that image 
// and adding the Bitmap to the stage 
function imagesLoaded(e) {
    initRoom();
    initStats();
    initHero();
    

    initBlock(4*scale*15,5*scale*15);

    initBox(4*scale*15,6*scale*15);
    initBox(5*scale*15,6*scale*15);

    initBox(4*scale*15,7*scale*15);
    initBox(5*scale*15,7*scale*15);

    initBlock(12*scale*15,5*scale*15);

    initBox(12*scale*15,4*scale*15);
    initBox(13*scale*15,4*scale*15);

    initBox(12*scale*15,3*scale*15);
    initBox(13*scale*15,3*scale*15);

    initBlock(4*scale*15,16*scale*15);

    initBlock(12*scale*15,16*scale*15);

    initEnemie();
    initEnemie();
    initEnemie();

    let ground = room.getChildByName('ground');
    room.children.forEach((child) => {
        child.scaleX = scale;
        child.scaleY = scale;
        child.regX = (ground.image.width/2);
        child.regY = (ground.image.height/2);
    });

    // set the Ticker to 30fps 
    createjs.Ticker.setFPS(40); 
    createjs.Ticker.addEventListener('tick', this.onTick.bind(this));
}

// update the stage every frame 
function onTick(e) {
    if(!e.paused){
        stats.begin();

        heroes.forEach((hero) =>{
            hero.move();
        });

        enemies.forEach((en) =>{
            en.move();
        })

        let wall = room.getChildByName('wall');

        eballs = eballs.filter((ball) => {
            ball.move();
            if(!collision(wall,ball,ball.damage)&&(!collisionSprite(boxs,ball))&&(!collisionContainer(heroes,ball))){
                return ball;
            }
            ballFinish(ball);
        });

        balls = balls.filter((ball) => {
            ball.move();
            if(!collision(wall,ball,ball.damage)&&(!collisionSprite(boxs,ball)&&(!collisionContainer(enemies,ball)))){
                return ball;
            }
            ballFinish(ball);
        });

        explodeBalls = explodeBalls.filter((ball) => {
            if(ball.currentAnimationFrame > 4){
                stage.removeChild(ball);
                room.removeChild(ball)
            }else{
                return ball;
            }
        });
    
        stage.update();
    
        stats.end();
    }
    
}

function ballFinish(ball){
    ball.gotoAndStop('shoot');
    ball.gotoAndPlay('explode');
    explodeBalls.push(ball);
}


function collisionSprite(array, ref){
    let index = array.find((el) => {
        if(rectCollision(el,ref)){
            if(ref.damage&&el.takeDamage){
                el.takeDamage(ref.damage);
            }            
            return true;
        }
    })
    return (index);
}

function collisionContainer(array, ref){
    let index = array.find((el) => {
        let sprite = el.children[0];
        if(pixelCollision(sprite,ref,window.alphaThresh)){
            if(ref.damage){
                el.takeDamage(ref.damage);
            }            
            return true;
        }
    })
    return (index);
}

function collision(object, ref){
    return pixelCollision(object,ref,window.alphaThresh);
}

function rotation(x, y){
    let point = {
        adjacent:Math.sqrt(Math.pow(x,2)),
        hypothenuse:Math.sqrt(Math.pow(x,2)+Math.pow(y,2))
    };
    return Math.acos(point.adjacent/point.hypothenuse)*180/Math.PI;
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