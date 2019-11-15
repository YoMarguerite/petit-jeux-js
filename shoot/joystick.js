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

    move(x, y){
        if(this.collision(x, y)){
            this.xInt = x;
            this.yInt = y;
        }else{
            var dx = x-this.x;
            var dy = y-this.y;
            var divise = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
            this.xInt = dx/divise*radius;
            this.yInt = dy/divise*radius;
        }
    }

    collision(x, y){
        return (x<=this.x+this.radiusExt) && (x>=this.x-this.radiusExt) && (y<=this.y+this.radius) && (y>=this.y-this.radius);
    }
}

