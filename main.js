import * as pers from './shoot/Perso/perso.js';
import * as key from './shoot/shoot-keys.js';
import * as config from './shoot/Config/config.js';
createjs.Sound.registerSound('./shoot/Sprite/Weapon/revolver/sound.mp3','revolver');
const Perso = pers.perso;

const canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stage = new createjs.Stage(canvas);
stage.enableMouseOver(20)
canvas.getContext("2d").imageSmoothingEnabled = false;

const cosmo = config.cosmo;
const perso = new Perso({x:canvas.width/2, y:canvas.height/2, scale:1}, cosmo.sprite,cosmo.attack, cosmo.life, cosmo.speed);

const scale = size(cosmo.factor, window.innerHeight, perso.image.width);

var persoImage = new createjs.Bitmap(perso.image);
persoImage.scale = scale;
persoImage.regX = persoImage.image.width/2;
persoImage.regY = persoImage.image.height/2;

const weapon = createWeapon();

var balls = [];

var persoContainer = new createjs.Container();
persoContainer.addChild(persoImage, weapon);

stage.addChild(persoContainer);

var mousepos = {x:0,y:0};
canvas.addEventListener("mousemove", function(evt){
    mousepos = {x:evt.x, y:evt.y};
    let origin = {x:persoContainer.x+weapon.x, y:persoContainer.y+weapon.y};
    let point = {
        adjacent:Math.sqrt(Math.pow(mousepos.x-origin.x,2)),
        hypothenuse:Math.sqrt(Math.pow(mousepos.x-origin.x,2)+Math.pow(mousepos.y-origin.y,2))
    };
    weapon.rotation = Math.sign(weapon.scaleX)*Math.sign(mousepos.y-origin.y)
    *Math.acos(point.adjacent/point.hypothenuse)*180/Math.PI;
})

var firebool = true;
var interval;

canvas.addEventListener("mousedown", function(evt){
    if(firebool){
        let fire = createFire(weapon);
        firebool = false;
        setTimeout(function(){firebool=true},500);
    }
    interval = setInterval(function(){createFire(weapon)}, 500);
})

canvas.addEventListener("mouseup", function(evt){
    clearInterval(interval)
})

createjs.Ticker.addEventListener("tick", tick);
createjs.Ticker.setFPS(60);

function tick(event){
    let position = perso.move(key.getCoordonees(), mousepos.x);
    persoContainer.x = position.x;
    persoContainer.y = position.y;
    persoImage.scaleX = scale*position.scale;
    weapon.scaleX = 2*position.scale;
    balls.forEach((ball) => {
        ball.move();
    })
    stage.update(event);	
}

function size(factor, ref, size){
    let percent = ref/100
    return factor*(percent/size);
}

function createWeapon(){

    let img = new Image();
    img.src = './shoot/Sprite/Weapon/revolver/revolver.png';

    let weapon = new createjs.Bitmap(img);
    weapon.scale = 2;
    weapon.regY = weapon.image.height/2;
    weapon.y = 25;

    return weapon;
}

function createFire(weapon){
    createjs.Sound.play('revolver');
    weapon.image.src='./shoot/Sprite/Weapon/revolver/revolver-shoot.png';
    setTimeout(function(){weapon.image.src='./shoot/Sprite/Weapon/revolver/revolver.png'},100);

    let img = new Image();
    img.src = './shoot/Sprite/Weapon/revolver/fire.png';

    let fire = new createjs.Bitmap(img);

    fire.scaleX = Math.sign(weapon.scaleX);
    fire.rotation = weapon.rotation;
    
    fire.x = persoContainer.x+((weapon.image.width*weapon.scaleX)*Math.cos(fire.rotation*Math.PI/180));
    fire.y = persoContainer.y+15+((weapon.image.width*weapon.scaleX)*Math.sin(fire.rotation*Math.PI/180));

    fire.regX = img.width/2;
    fire.regY = img.height/2;

    let pointA = {x:mousepos.x,y:mousepos.y};
    let pointB = {x:persoContainer.x, y:persoContainer.y};

    fire.move = function(){
        
        let coef = calculCoefDirection(pointA, pointB);
        this.x += coef.x*10;
        this.y += coef.y*10;
    }
    balls.push(fire);
    stage.addChild(fire);
    return fire;
}

function calculCoefDirection(pointA, pointB){
    var dx = pointA.x-pointB.x;
    var dy = pointA.y-pointB.y;
    var divise = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
    dx = dx/divise;
    dy = dy/divise;
    return {x:dx, y:dy};
}