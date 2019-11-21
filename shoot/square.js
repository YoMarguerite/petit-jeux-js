class square{
    constructor(width, height, color, x, y, dx, dy){
        this.width = width;
        this.height = height;
        this.color = color;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.speed = dx+dy;
    }

    move(dx, dy){
        if((dx != undefined)&&(dy != undefined)){
            var multi = this.speed/(Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2)));
            this.x += dx*multi/2;
            this.y += dy*multi/2;
        }else{
            if(rightPressed && this.x < canvas.width-this.width){
                this.x += this.dx;
            }
            if(leftPressed && this.x > 0){
                this.x -= this.dx;
            }
            if(upPressed && this.y > 0){
                this.y -= this.dy;
            }
            if(downPressed && this.y < canvas.height-this.height){
                this.y += this.dy;
            }
        }
        
    }

    collision(x, y){
        return (x>=this.x) && (x<=this.x+this.width) && (y>=this.y) && (y<=this.y+this.height)
    }
}

function initSquare( x, y, config, orientation = true){
    var width, height, posx, posy;
    width = x/config.width;
    height = config.square?width:y/config.height;
    if(orientation){
        posx = (x-width)/config.x;
        posy = (y-height)/config.y;
    }else{
        posx = (y-height)/config.y;
        posy = -(x-width)/config.x;
    }
    return new square( width, height, config.color, posx, posy, config.dx, config.dy);
}

function drawSquare(square) {
    ctx.beginPath();
    ctx.rect(square.x, square.y, square.width, square.height);
    ctx.fillStyle = square.color;
    ctx.fill();
    ctx.closePath();
}