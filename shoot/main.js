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

var imwp = new Image();
imwp.src = './Sprite/Weapon/revolver.png';
var weapon = new createjs.Bitmap(imwp);
weapon.scale = 2;
// weapon.regX = weapon.image.width/2
weapon.regY = weapon.image.height/2
// weapon.x=25
weapon.y = 25

var balls = [];

var persoContainer = new createjs.Container();
persoContainer.addChild(persoImage, weapon);

stage.addChild(persoContainer)

canvas.addEventListener("mousemove", function(evt){
    var mouse = {x:evt.clientX, y:evt.clientY};
    var origin = {x:persoContainer.x+weapon.x, y:persoContainer.y+weapon.y};
    var point = {
        adjacent:Math.sqrt(Math.pow(mouse.x-origin.x,2)),
        hypothenuse:Math.sqrt(Math.pow(mouse.x-origin.x,2)+Math.pow(mouse.y-origin.y,2))
    };
    weapon.rotation = Math.sign(weapon.scaleX)*Math.sign(mouse.y-origin.y)
    *Math.acos(point.adjacent/point.hypothenuse)*180/Math.PI;
})

canvas.addEventListener("click", function(evt){
    var fire = new Image();
    fire.src = './Sprite/Weapon/fire.png';
    var img = new createjs.Bitmap(fire);
    img.scaleX = Math.sign(weapon.scaleX);
    img.rotation = weapon.rotation;
    img.x = evt.clientX;
    img.y = evt.clientY;
    img.regX = fire.width/2;
    img.regY = fire.height/2;
    img.coefx = 1;
    img.coefy = 1;
    balls.push(img);
    stage.addChild(img);
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
        ball.x+=ball.coefx;
        ball.y+=ball.coefy;
    })
    stage.update(event);	
}

function size(factor, ref, size){
    let percent = ref/100
    return factor*(percent/size);
}