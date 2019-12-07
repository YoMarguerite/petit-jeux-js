function createWeapon(){

    let img = new Image();
    img.src = './shoot/Sprite/Weapon/revolver/revolver.png';

    let weapon = new createjs.Bitmap(img);
    weapon.scale = 1;
    weapon.regY = weapon.image.height/2;
    weapon.y = weapon.image.height/2;

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
    fire.y = persoContainer.y+weapon.y+((weapon.image.width*weapon.scaleX)*Math.sin(fire.rotation*Math.PI/180));

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

function createGround(){
    let ground = new Image();
    ground.src = './shoot/Sprite/ground.png';
    let map1 = new createjs.Bitmap(ground);
    map1.regX = ground.width/2;
    map1.regY = ground.height/2;

    let wall = new Image();
    wall.src = './shoot/Sprite/wall.png';
    let map2 = new createjs.Bitmap(wall);
    map2.regX = wall.width/2;
    map2.regY = wall.height/2;
    
    let contain = new createjs.Container();
    contain.addChild(map1, map2);
    contain.scale = 5; 
    contain.x = canvas.width/2;
    contain.y = canvas.height/2;
    return contain;
}