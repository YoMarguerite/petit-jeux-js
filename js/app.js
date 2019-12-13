var canvas, stage, af, hero, enemies=[], balls=[], explodeBalls=[], boxs=[], room, stats, scale;

var COSMO = 'assets/cosmo.png',
    GUN = 'assets/revolver.png',
    FIRE = 'assets/fire.png',
    GOBELIN = 'assets/gobelin.png',
    WALL = 'assets/wall3.png',
    GROUND = 'assets/ground.png',
    BOX = 'assets/box.png';


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
    af.loadAssets([COSMO,GUN,FIRE,GOBELIN,WALL,GROUND,BOX]);
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

    scale = size(10, canvas.height, 28);
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
            gun:{frames:[0],next:false},
            shoot:{frames:[1],next:false},
        }
    });

    var gun = new createjs.Sprite(gunss);
    gun.gotoAndPlay('gun');
    let gunsize = size(25, perso.spriteSheet._frameWidth*perso.scaleY, 15);
    gun.scaleX = gunsize;
    gun.scaleY = gunsize;
    gun.lastShoot = 0;
    gun.name ='gun';
    
    return gun;
}

function initHero(){
    
    var perso = initPerso();
    var gun = initGun(perso);
    gun.y = 10;
    gun.move = function(){
        let x = stage.mouseX-this.parent.x;
        let y = stage.mouseY-this.parent.y;
        this.rotation = Math.sign(y)*rotation(x,y);
    
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
                initBall(this,hero);
            }
        }
    };

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

function initBall(gun,origin,destination){
    let ballss = new createjs.SpriteSheet({
        images:[af[FIRE]],
        frames: {width:22,height:20,count:6,regX:11, regY:10},
        animations:{
            shoot:{frames:[0],next:false},
            explode:{frames:[1,2,3,4,5],speed:0.5,next:false}
        }
    });
    let ball = new createjs.Sprite(ballss);
    ball.x = origin.x-room._matrix.tx;
    ball.y = origin.y-room._matrix.ty;
    ball.scaleX = Math.sign(origin.scaleX)*gun.scaleX;
    ball.scaleY = gun.scaleY;
    ball.rotation = Math.sign(origin.scaleX)*origin.children[1].rotation;
    let dx = stage.mouseX-origin.x;
    let dy = stage.mouseY-origin.y;
    let divise = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
    ball.velX = dx/divise;
    ball.velY = dy/divise;
    ball.speed = 20;
    ball.damage = 1;
    ball.gotoAndPlay('shoot');
    ball.move = function(){
        this.x += this.velX*this.speed;
        this.y += this.velY*this.speed;
    }
    balls.push(ball);
    room.addChild(ball);
}

function initGobelin(){
    var gobelinss = new createjs.SpriteSheet({
        images:[af[GOBELIN]],
        frames: {width:26, height:28, count:5, regX:13, regY:14}, 
        animations:{
            head:{frames:[0,1],speed:0.15}, 
            move:{frames:[0,2],speed:0.15},
            damage:{frames:[3],next:false},
            dead:{frames:[4], next:false}
        }
    });

    var gobelin = new createjs.Sprite(gobelinss);
    gobelin.gotoAndPlay('head');
    gobelin.speed = 5;
    gobelin.life = 5;
    gobelin.lastShoot = 0;

    gobelin.takeDamage = function(damage){
        this.life -= damage;
        if(this.life <= 0){
            this.life = 0;
            let index = enemies.indexOf(this);
            enemies.splice(index,1);
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
    
    enemies.push(gobelin);
    return gobelin;
}

function initEnemie(){

    let gobelin = initGobelin();
    let gun = initGun(gobelin);
    gun.y = 4;
    gun.move = function(){
        let x = hero.x-(room.x-(this.parent.regX*this.parent.scaleX)+this.parent.x);
        let y = hero.y-(room.y-(this.parent.regY*this.parent.scaleY)+this.parent.y);
        this.rotation = Math.sign(x*y)*rotation(x,y);
    
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
                //initBall(this);
            }
        }
    };

    let cont = new createjs.Container();
    cont.addChild(gobelin);
    cont.addChild(gun);
    cont.x = 4*scale*15;
    cont.y = 15*scale*15;
    cont.name='gobelinContainer';
    cont.move = function(){
        let coef = Math.sign(hero.x-(room.x-(this.regX*this.scaleX)+this.x));
        this.children.forEach((child) => {
            child.scaleX = coef*child.scaleY;
            child.move();
        })
    };

    console.log(cont);
    room.addChild(cont);
    enemies.push(gobelin);
}

function initRoom(){

    room = new createjs.Container();
    
    room.velX = 5;
    room.velY = 5;
    room.move = function() {
        let ref = hero.getChildByName('hero'),x=0,y=0;
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
        let clone = this.clone(true);
        clone.x += x;
        let array = clone.children.filter((child) => {
            return (child.name === 'box')&&(child.currentAnimation!='one');
        });
        if(!collision(clone,ref)&&(!collisionArray(array,ref))){
            this.x += x;
        }
        clone.x -= x;
        clone.y += y;
        array = clone.children.filter((child) => {
            return (child.name === 'box')&&(child.currentAnimation!='one');
        });
        if(!collision(clone,ref)&&(!collisionArray(array,ref))){
            this.y += y;
        }

        this.getChildByName('gobelinContainer').move();
    };

    stage.addChild(room);
}

function initGround(){
    let ground = new createjs.Bitmap(af[GROUND]);
    ground.name='ground';
    room.addChild(ground);
}

function initBox(x,y){
    let boxss = new createjs.SpriteSheet({
        images:[af[BOX]],
        frames: {width:15,height:15,count:4,regX:7.5,regY:7.5},
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

function initWall(){
    let wall = new createjs.Bitmap(af[WALL]);
    wall.name='wall';
    room.addChild(wall);    
    room.x = canvas.width/2;
    room.y = canvas.height/2;
}

// creating a Bitmap with that image 
// and adding the Bitmap to the stage 
function imagesLoaded(e) {
    initRoom();
    initGround();
    initStats();
    initHero();
    initWall();
    initEnemie();

    initBox(4.5*scale*15,6.5*scale*15);
    initBox(5.5*scale*15,6.5*scale*15);

    initBox(4.5*scale*15,7.5*scale*15);
    initBox(5.5*scale*15,7.5*scale*15);

    initBox(12.5*scale*15,4.5*scale*15);
    initBox(13.5*scale*15,4.5*scale*15);

    initBox(12.5*scale*15,3.5*scale*15);
    initBox(13.5*scale*15,3.5*scale*15);

    let ground = room.getChildByName('ground');
    room.children.forEach((child) => {
        child.scaleX = scale;
        child.scaleY = scale;
        child.regX = (ground.image.width/2);
        child.regY = (ground.image.height/2);
    });

    // set the Ticker to 30fps 
    createjs.Ticker.setFPS(30); 
    createjs.Ticker.addEventListener('tick', this.onTick.bind(this));
}

// update the stage every frame 
function onTick(e) {
    stats.begin();
    hero.move();
    room.move();

    enemies.forEach((en) =>{
        en.move();
    })

    balls = balls.filter((ball) => {
        ball.move();
        if(!collision(room,ball,ball.damage)&&(!collisionArray(boxs,ball)&&(!collisionArray(enemies,ball)))){
            return ball;
        }
        ball.gotoAndStop('shoot');
        ball.gotoAndPlay('explode');
        explodeBalls.push(ball);
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

function collisionArray(array, ref){
    //console.log(array);
    let index = array.find((el) => {
        if(pixelCollision(el,ref,window.alphaThresh)){
            if(ref.damage){
                el.takeDamage(ref.damage);
            }            
            return true;
        }
    })
    return (index);
}

function collision(object, ref){
    return pixelCollision(object.getChildByName('wall'),ref,window.alphaThresh);
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