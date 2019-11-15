class ball{
    constructor(radius, x, y, dx, dy) {
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
    }

    move(){
        this.x += this.dx;
        this.y += this.dy;
    }

    collision(x, y){
        return (x<=this.x+this.radius) && (x>=this.x-this.radius) && (y<=this.y+this.radius) && (y>=this.y-this.radius);
    }
}

function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}