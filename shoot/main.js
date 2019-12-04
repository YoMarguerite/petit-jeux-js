import * as pers from './Perso/perso.js';
import * as mouse from './shoot-click.js';
import * as key from './shoot-keys.js';
import * as config from './Config/config.js';

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

canvas.addEventListener("mousemove", function(evt){
    let mouse = {x:evt.clientX, y:evt.clientY};
    let origin = {x:persoContainer.x+weapon.x, y:persoContainer.y+weapon.y};
    let point = {
        adjacent:Math.sqrt(Math.pow(mouse.x-origin.x,2)),
        hypothenuse:Math.sqrt(Math.pow(mouse.x-origin.x,2)+Math.pow(mouse.y-origin.y,2))
    };
    weapon.rotation = Math.sign(weapon.scaleX)*Math.sign(mouse.y-origin.y)
    *Math.acos(point.adjacent/point.hypothenuse)*180/Math.PI;
})

canvas.addEventListener("click", function(evt){
    let fire = createFire(evt.clientX,evt.clientY,weapon);
    balls.push(fire);
    stage.addChild(fire);
    console.log(stage)
})

createjs.Ticker.addEventListener("tick", tick);
createjs.Ticker.setFPS(60);

function tick(event){
    let position = perso.move(key.getCoordonees(), mouse.coordonne.x);
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
    img.src = './Sprite/Weapon/revolver.png';

    let weapon = new createjs.Bitmap(img);
    weapon.scale = 2;
    weapon.regY = weapon.image.height/2;
    weapon.y = 25;

    return weapon;
}

function createFire(x, y, weapon){

    let img = new Image();
    img.src = './Sprite/Weapon/fire.png';

    let fire = new createjs.Bitmap(img);

    fire.scaleX = Math.sign(weapon.scaleX);
    fire.rotation = weapon.rotation;

    fire.x = x;
    fire.y = y;

    fire.regX = img.width/2;
    fire.regY = img.height/2;

    fire.move = function(coef){
        this.x += coef.dx;
        this.y += coef.dy;
    }

    return fire;
}

function calculCoefDirection(pointA, pointB){
    var dx = pointA.x-pointB.x;
    var dy = pointA.y-pointB.y;
    var divise = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
    dx = dx/divise;
    dy = dy/divise;
    return [dx, dy];
}