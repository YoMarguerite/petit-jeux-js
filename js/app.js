let canvas, stage, af, hero, life, shield, heroes=[], enemies=[], balls=[], eballs=[], explodeBalls=[], chests=[], boxs=[], picks=[], room, walls=[], doors=[], stats, scale;
let finish = false;
let COSMO = 'assets/sprite/cosmo.png',
    GUN = 'assets/weapon/revolver/gun.png',
    FIRE = 'assets/weapon/revolver/fire.png',
    GOBELIN = 'assets/sprite/gobelin.png',
    BLOCK = 'assets/obstacle/block.png',
    WALL = 'assets/wall/test.png',
    GROUND = 'assets/wall/ground.png',
    WAYWALL = 'assets/wall/way_wall.png',
    WAYGROUND = 'assets/wall/way_ground.png',
    LITTLEWALL = 'assets/wall/little.png',
    LITTLEGROUND = 'assets/wall/little_ground.png',
    DOOR = 'assets/wall/door.png',
    BOX = 'assets/obstacle/box.png',
    CHEST = 'assets/obstacle/chest.png',
    PICK = 'assets/obstacle/pick.png';


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
   
    scale = size(10, canvas.height, 26);
    // creating a new HTMLImage
    af = new AssetFactory();
    af.onComplete = function() {
        imagesLoaded();
    }
    af.loadAssets([COSMO,GUN,FIRE,GOBELIN,WALL,GROUND,WAYWALL,WAYGROUND,LITTLEWALL,LITTLEGROUND,DOOR,BOX,BLOCK,CHEST,PICK]);
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
            damage:{frames:[3],speed:0.15,next:"head"},
            dead:{frames:[4], next:false}
        }
    });
    return ss;
}

function initPerso(){

    var perso = new createjs.Sprite(createPersoSS([af[COSMO]],24,26));
    perso.gotoAndPlay('head');
    perso.frameRef = 0;
    
    perso.scaleX = scale;
    perso.scaleY = scale;

    perso.name = 'hero';

    perso.move = function(){
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
            this.lastShoot = createjs.Ticker.getTime(true);
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
            shoot:{frames:[1],speed:0.15,next:'gun'},
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
    var gun = initGun(perso);
    gun.y = 10;
    gun.move = function(){
        let x = stage.mouseX-this.parent.x;
        let y = stage.mouseY-this.parent.y;
        this.rotation = Math.sign(y)*rotation(x,y);
    
        let tick = createjs.Ticker.getTime(true);
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
    cont.addChild(perso);
    cont.addChild(gun);
    

    cont.x = canvas.width/2;
    cont.y = canvas.height/2;
    cont.life = 5;
    cont.lifemax = 5;
    cont.shield = 5;
    cont.shieldmax = 5;
    cont.lastRecovery = 0;
    
    cont.move = function(){
        if(this.shield < 5){
            if(createjs.Ticker.getTime(true)>this.lastRecovery){
                this.lastRecovery = createjs.Ticker.getTime()+3000;
                this.shield++;
                shield.children[2].text = this.shield+'/'+this.shieldmax;
                let rect2 = new createjs.Shape();
                rect2.graphics.beginFill("blue").drawRoundRect(0, 0, 200*(this.shield/this.shieldmax), 30,20);
                shield.children[1] = rect2;
            }
        }
        this.scaleX = stage.mouseX < this.x ? -this.scaleY : this.scaleY;
        this.children.forEach((child) => {
            child.move();
        });
        room.move();
    };

    cont.takeDamage = function(damage){
        this.lastRecovery = createjs.Ticker.getTime()+3000;
        if(perso.currentAnimation !== 'damage'){
            this.shield -= damage;
            if(this.shield < 0){
                this.life += this.shield;
                this.shield = 0;
                if(this.life <= 0){
                    this.life = 0;
                    let index = heroes.indexOf(this);
                    heroes.splice(index,1);
                    this.removeChild(gun);
                }
            }
            
            perso.takeDamage(this.life);
    
            life.children[2].text = this.life+'/'+this.lifemax;
            let rect = new createjs.Shape();
            rect.graphics.beginFill("red").drawRoundRect(0, 0, 200*(this.life/this.lifemax), 30,20);
            life.children[1] = rect;

            shield.children[2].text = this.shield+'/'+this.shieldmax;
            let rect2 = new createjs.Shape();
            rect2.graphics.beginFill("blue").drawRoundRect(0, 0, 200*(this.shield/this.shieldmax), 30,20);
            shield.children[1] = rect2;
        }
    };
    
    let b = cont.getBounds();
    cont.setBounds(b.x,b.y,0,0);
    stage.addChild(cont);
    heroes.push(cont);
    hero = cont;
    console.log(cont.getBounds());
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

    let gobelin = new createjs.Sprite(createPersoSS([af[GOBELIN]],18,26));
    gobelin.gotoAndPlay('move');
    gobelin.frameRef = 0;
    gobelin.lastShoot = 0;
    gobelin.lastMove = 0;

    gobelin.takeDamage = function(life){
        if(life === 0){
            this.gotoAndPlay('dead');
        }else{
            this.lastShoot = createjs.Ticker.getTime(true);
            this.gotoAndPlay('damage');
        }
    };
    
    return gobelin;
}

function initEnemie(){

    let gobelin = initGobelin();
    let gun = initGun(gobelin);
    gun.y = 4;
    gun.lastShoot = createjs.Ticker.getTime(true);
    gun.nextShoot = gun.lastShoot+((Math.random()*5)+5)*1000;
    gun.move = function(){
        let x = hero.x-(room.x-(this.parent.regX*this.parent.scaleX)+this.parent.x);
        let y = hero.y-(room.y-(this.parent.regY*this.parent.scaleY)+this.parent.y);
        this.rotation = Math.sign(x*y)*rotation(x,y);
    
        let tick = createjs.Ticker.getTime(true);
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
        });
        gun.move();


        let time = createjs.Ticker.getTime(true);
        if(time>this.lastMove&&time<this.lastMove+this.lapsMove){ 

            if(gobelin.currentAnimation==='head'){
                gobelin.gotoAndPlay('move');
            }    

            this.x+=this.velX;            
            if(collisionSprite(boxs,gobelin)||collisionDoor(walls.concat(doors),gobelin)){
                this.x-=this.velX;
            }
            
            this.y+=this.velY;            
            if(collisionSprite(boxs,gobelin)||collisionDoor(walls.concat(doors),gobelin)){
                this.y-=this.velY;
            }
        }
        if(time>this.lastMove+this.lapsMove){
            gobelin.gotoAndPlay('head');
            this.lastMove = time+(Math.random()*3+1)*1000;
            this.lapsMove = (Math.random()*3+1)*1000;
            let dx = Math.floor(hero.x-(room.x-this.regX*scale+this.x));
            let dy = Math.floor(hero.y-(room.y-this.regY*scale+this.y));
            let divise = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
            this.velX = dx/divise*this.speed;
            this.velY = dy/divise*this.speed;
        }
    };

    cont.takeDamage = function(damage){
        this.life -= damage;
        if(this.life <= 0){
            this.life = 0;
            let index = enemies.indexOf(this);
            enemies.splice(index,1);
            this.removeChild(this.children[1]);
        }
        gobelin.takeDamage(this.life);
    };

    room.addChild(cont);
    enemies.push(cont);
}

function initRoom(){

    let ground = new createjs.Bitmap(af[GROUND]);
    ground.name='ground';
    let wall = new createjs.Bitmap(af[WALL]);

    let wayground = new createjs.Bitmap(af[WAYGROUND]);
    wayground.x = 15*6*scale;
    wayground.y = 15*25*scale-(6*scale);
    let waywall = new createjs.Bitmap(af[WAYWALL]);
    waywall.x = 15*6*scale;
    waywall.y = 15*25*scale-(6*scale);
    
    let littleground = new createjs.Bitmap(af[LITTLEGROUND]);
    littleground.x = 0;
    littleground.y = 15*34*scale;
    let littlewall = new createjs.Bitmap(af[LITTLEWALL]);
    littlewall.x = 0;
    littlewall.y = 15*34*scale;

    walls.push(wall,waywall,littlewall);
      
    room = new createjs.Container();

    room.addChild(ground);
    room.addChild(wall);  
    room.addChild(wayground);
    room.addChild(waywall);
    room.addChild(littleground);
    room.addChild(littlewall);
    
    room.x = canvas.width/2;
    room.y = canvas.height/2;
    room.velX = 5;
    room.velY = 5;
    room.move = function() {

        let ref = hero.getChildByName('hero'),
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
        if(collisionDoor(walls.concat(doors),ref)||(collisionSprite(boxs,ref))){
            this.x -= x;
        }
        this.y += y;
        if(collisionDoor(walls.concat(doors),ref)||(collisionSprite(boxs,ref))){
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

function initChest(x,y){
    let chestss = new createjs.SpriteSheet({
        images:[af[CHEST]],
        frames: {width:30,height:15,count:4},
        animations:{
            close:0,
            open:{frames:[0,1,2,3],speed:0.1,next:false}
        }
    });
    let chest = new createjs.Sprite(chestss);
    chest.gotoAndPlay('close');
    chest.x = x;
    chest.y = y;
    room.addChild(chest);
    chests.push(chest);
}

function initPick(x,y){
    let pickss = new createjs.SpriteSheet({
        images:[af[PICK]],
        frames: {width:15,height:15,count:3},
        animations:{
            open:{frames:[0,1,2],speed:0.1, next:'close'},
            close:{frames:[2,1,0],speed:0.1, next:false}
        }
    });
    let pick = new createjs.Sprite(pickss);
    pick.gotoAndPlay('close');
    pick.x = x;
    pick.y = y;
    pick.damage = 1;
    pick.touch = false;
    pick.lastShoot = 0;
    pick.move = function(){
        let time = createjs.Ticker.getTime(true);
        if(time > this.lastShoot+5000){
            this.lastShoot = time;
            this.touch = false;
            this.gotoAndPlay('open');
        }
    };

    room.addChild(pick);
    picks.push(pick);
}

function initDoor(x,y){
    let width=60, height=25;
    let ss = new createjs.SpriteSheet({
        images:[af[DOOR]],
        frames: {width:width, height:height, count:4, regX:width/2, regY:height/2}, 
        animations:{
            close:{frames:[0],next:false}, 
            opening:{frames:[0,1,2,3],speed:0.1, next:false},
            closing:{frames:[3,2,1,0],speed:0.1, next:false}
        }
    });

    let door = new createjs.Sprite(ss);
    door.gotoAndPlay('opening');
    door.x = x;
    door.y = y;

    room.addChild(door)
    doors.push(door);
}

function initLife(){
    
    let rect = new createjs.Shape();
    rect.graphics.beginFill("grey").beginStroke("black").setStrokeStyle(2).drawRoundRect(0, 0, 200, 30,20);
    let rect2 = new createjs.Shape();
    rect2.graphics.beginFill("red").drawRoundRect(0, 0, 200, 30,20);

    let text = new createjs.Text('5/5','20px game','black');
    let b = text.getBounds();
    text.x = 100-(b.width/2);
    text.y = 15-(b.height/2);
    
    let cont = new createjs.Container();
    cont.addChild(rect);
    cont.addChild(rect2);
    cont.addChild(text);
    
    stage.addChild(cont);
    return cont
}

function initShield(){
    
    let rect = new createjs.Shape();
    rect.graphics.beginFill("grey").beginStroke("black").setStrokeStyle(2).drawRoundRect(0, 0, 200, 30,20);
    let rect2 = new createjs.Shape();
    rect2.graphics.beginFill("blue").drawRoundRect(0, 0, 200, 30,20);

    let text = new createjs.Text('5/5','20px game','black');
    let b = text.getBounds();
    text.x = 100-(b.width/2);
    text.y = 15-(b.height/2);
    
    let cont = new createjs.Container();
    cont.addChild(rect);
    cont.addChild(rect2);
    cont.addChild(text);
    
    cont.y= 35;

    stage.addChild(cont);
    return cont
}

function initPause(){
    
    let color1="#ff6600", color2="#a32e07";

    let rect = new createjs.Shape();
    rect.graphics.beginFill(color1).beginStroke(color2).setStrokeStyle(2).drawRoundRect(0, 0, 100, 30,20);


    let text = new createjs.Text('||','18px game',color2);
    let b = text.getBounds();
    text.x = 50-(b.width/2);
    text.y = 15-(b.height/2);
    
    let cont = new createjs.Container();
    cont.addChild(rect);
    cont.addChild(text);
    cont.x = canvas.width-105;
    cont.y = 0;

    cont.addEventListener('click', function(e){
        color1="#ff6600", color2="#a32e07";
        let pause = createjs.Ticker.getPaused(), textButton = '||';
        createjs.Ticker.setPaused(!pause);
        if(!pause){
            let echange = color1;
            color1 = color2;
            color2 = echange;
            textButton = '▶';
        }
        rect.graphics = new createjs.Graphics().beginFill(color1).beginStroke(color2).setStrokeStyle(2).drawRoundRect(0,0,100,30,20);
        text.color = color2;
        text.text = textButton;
        stage.update();
    })
    
    stage.addChild(cont);
    return cont
}


// creating a Bitmap with that image 
// and adding the Bitmap to the stage 
function imagesLoaded(e) {
    initRoom();
    initStats();
    initHero();
    initDoor(15*9*scale,358*scale);

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

    for(let i = 0; i<8; i++){
        if(i<7){
            initPick(4*15*scale,(37+i)*15*scale);
            initPick(13*15*scale,(37+i)*15*scale);
        }
        initPick((5+i)*15*scale,37*15*scale);
        initPick((5+i)*15*scale,43*15*scale);
    }    

    initChest(8*15*scale,40*15*scale);

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

    enemies.forEach((en)=>{
        let sprite = en.children[0];
        do{
            en.x = ((Math.random()*15)+1)*scale*15;
            en.y = ((Math.random()*21)+1)*scale*15;
        }while(collisionDoor(walls.concat(doors),sprite)||collisionSprite(boxs,sprite));
    });

    life = initLife();
    shield = initShield();
    initPause();
    

    // set the Ticker to 30fps 
    createjs.Ticker.setFPS(40); 
    createjs.Ticker.addEventListener('tick', this.onTick.bind(this));
}

// update the stage every frame 
function onTick(e) {
    if(!blur&&!e.paused){
        
        stats.begin();

        picks.forEach((pick) => {
            pick.move();
            if(pick.currentAnimation == 'open'&&!pick.touch){
                heroes.forEach((hero) => {
                    if(rectCollision(hero, pick)){
                        pick.touch = true;
                        hero.takeDamage(pick.damage);
                    }
                });
            }
        });

        chests.forEach((chest) => {
            if(chest.currentAnimation !== 'open'){
                heroes.forEach((hero) => {
                    if(rectCollision(hero, chest)){
                        chest.gotoAndPlay('open');
                    }
                }); 
            }
        });

        heroes.forEach((heroe) =>{
            heroe.move();
        })

        enemies.forEach((en) =>{
            en.move();
        })

        if((enemies.length === 0)&&(!finish)){
            doors.forEach((door)=>{
                door.gotoAndPlay('opening');
            })
            finish = true;
        }

        eballs = eballs.filter((ball) => {
            ball.move();
            if(!collisionDoor(walls.concat(doors),ball)&&(!collisionSprite(boxs,ball))&&(!collisionContainer(heroes,ball))){
                return ball;
            }
            ballFinish(ball);
        });
        
        balls = balls.filter((ball) => {
            ball.move();
            if(!collisionDoor(walls.concat(doors),ball)&&(!collisionSprite(boxs,ball)&&(!collisionContainer(enemies,ball)))){
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
    return index;
}

function collisionDoor(array, ref){
    let index = array.find((el) => {
        return pixelCollision(el,ref,window.alphaThresh);
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