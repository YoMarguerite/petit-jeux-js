class square{
    constructor(height, width, color, x, y, dx, dy){
        this.height = height;
        this.width = width;
        this.color = color;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
    }

    move(){
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

    collision(x, y){
        return (x>=this.x) && (x<=this.x+this.width) && (y>=this.y) && (y<=this.y+this.height)
    }
}

function drawSquare(square) {
    ctx.beginPath();
    ctx.rect(square.x, square.y, square.width, square.height);
    ctx.fillStyle = square.color;
    ctx.fill();
    ctx.closePath();
}