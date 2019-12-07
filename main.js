createjs.Sound.registerSound('./shoot/Sprite/Weapon/revolver/sound.mp3','revolver');

const canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stage = new createjs.Stage(canvas);
stage.enableMouseOver(20)
canvas.getContext("2d").imageSmoothingEnabled = false;



class anime{
    constructor(images){
        this.image = new Image();
        this.image.src = images[0];
        this.images = images;
        this.interval = null;
        this.anime = null;
    }

    setAnim(anime, int){
        if((anime.length === 0) && (int > 0)){
            return false;
        }
        if((anime.filter((a) => {
            if(this.images[a] == null){
                
                return true;
            }
            return false;
        })).length != 0){
            return false;
        };
        this.anime = anime;
        this.image.src = this.images[this.anime[0]];
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            let index = this.images.indexOf(this.image.attributes.src.value)+1;
            this.image.src = index<this.anime.length ? this.images[this.anime[index]] : this.images[this.anime[0]];
        }, int);
        return true;
    }
}


class perso extends anime{
    constructor(position, images, life, attack, speed){
        super(images);
        this.position = position;
        this.life = life;
        this.attack = attack;
        this.speed = speed;
        this.boolFirstAnim = false;
        this.boolSecondAnim = false;
        this.weapon = null;
        this.weapons = [];
    }

    move(coordonnees, mouse){
        if(mouse > this.position.x){
            this.position.scale = 1;
        }else{
            this.position.scale = -1;
        }
        if((coordonnees.x === 0)&&(coordonnees.y === 0)){
            if(!this.boolFirstAnim){
                this.setAnim([0,1], 250);
                this.boolFirstAnim = true;
                this.boolSecondAnim = false;
            }
        }else{
            if(!this.boolSecondAnim){
                this.setAnim([0,2], 200);
                this.boolFirstAnim = false;
                this.boolSecondAnim = true;
            }
        }
        let dx = coordonnees.x*(this.speed);
        let dy = coordonnees.y*(this.speed);
        this.position.x += dx;
        this.position.y += dy;
        return this.position;
    }
}

const cosmo = new perso({x:canvas.width/2, y:canvas.height/2, scale:1}, hero.sprite,hero.attack, hero.life, hero.speed);

const scale = size(hero.factor, window.innerHeight, cosmo.image.width);

var persoImage = new createjs.Bitmap(cosmo.image);
persoImage.scale = scale;
persoImage.regX = persoImage.image.width/2;
persoImage.regY = persoImage.image.height/2;

const weapon = createWeapon();

var balls = [];

var persoContainer = new createjs.Container();
persoContainer.addChild(persoImage, weapon);


const ground = createGround();

stage.addChild(ground,persoContainer);

var mousepos = {x:0,y:0};
canvas.addEventListener("mousemove", function(evt){
    mousepos = {x:evt.x, y:evt.y};
});

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
createjs.Ticker._setFPS(30);

function tick(event){
    let position = cosmo.move(getCoordonees(), mousepos.x);
    persoContainer.x = position.x;
    persoContainer.y = position.y;
    persoImage.scaleX = scale*position.scale;
    weapon.scaleX = position.scale;
    balls.forEach((ball) => {
        if(!ndgmr.checkPixelCollision(ground.children[1], ball)){
            ball.move();
        }
    })

    rotate({x:persoContainer.x+weapon.x, y:persoContainer.y+weapon.y}, mousepos, weapon);

    stage.update(event);	
}

function size(factor, ref, size){
    let percent = ref/100
    return factor*(percent/size);
}

function calculCoefDirection(pointA, pointB){
    var dx = pointA.x-pointB.x;
    var dy = pointA.y-pointB.y;
    var divise = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
    dx = dx/divise;
    dy = dy/divise;
    return {x:dx, y:dy};
}

function rotate(origin, direction, el){
    let point = {
        adjacent:Math.sqrt(Math.pow(direction.x-origin.x,2)),
        hypothenuse:Math.sqrt(Math.pow(direction.x-origin.x,2)+Math.pow(direction.y-origin.y,2))
    };
    el.rotation = Math.sign(el.scaleX)*Math.sign(direction.y-origin.y)
    *Math.acos(point.adjacent/point.hypothenuse)*180/Math.PI;
}


