class joystick{
    constructor(radiusExt, radiusInt, colorExt, colorInt, x, y){
        this.radiusExt = radiusExt;
        this.radiusInt = radiusInt;
        this.colorExt = colorExt;
        this.colorInt = colorInt;
        this.x = x;
        this.y = y;
        this.xInt = x;
        this.yInt = y;
    }

    reset(){
        this.xInt = this.x;
        this.yInt = this.y;
    }

    move(x, y){
        var dx = x-this.x;
        var dy = y-this.y;
        var divise = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));

        if(this.collision(x, y)){
            this.xInt = x;
            this.yInt = y;
        }else{
            this.xInt = this.x+(dx/divise*this.radiusExt);
            this.yInt = this.y+(dy/divise*this.radiusExt);
        }

        return [dx/divise, dy/divise];
    }

    collision(x, y){
        return (x<=this.x+this.radiusExt) && (x>=this.x-this.radiusExt) && (y<=this.y+this.radiusExt) && (y>=this.y-this.radiusExt);
    }
}

function initJoystick(x, y, config, orientation = true){
    var radiusExt = orientation ? y/config.radiusExt:x/config.radiusExt;
    var radiusInt = orientation ? y/config.radiusInt:x/config.radiusInt;
    var radius  = radiusExt+radiusInt;
    if(orientation){
        var posx = config.x === "LEFT" ? radius:x-radius;
        var posy = config.y === "BOT" ? y-radius:radius;
    }else{
        var posy = config.x === "LEFT" ? radius:y-radius;
        var posx = config.y === "BOT" ? radius:x-radius;
    }
    return new joystick(radiusExt, radiusInt, config.colorExt, config.colorInt, posx, posy);
}

function drawJoystick(gamepad){
    ctx.beginPath();
    ctx.arc(gamepad.x, gamepad.y, gamepad.radiusExt, 0, Math.PI*2);
    ctx.fillStyle = gamepad.colorExt;
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(gamepad.xInt, gamepad.yInt, gamepad.radiusInt, 0, Math.PI*2);
    ctx.fillStyle = gamepad.colorInt;
    ctx.fill();
    ctx.closePath();
}
