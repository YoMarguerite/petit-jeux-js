export function drawSquare(ctx, square){
    ctx.beginPath();
    ctx.fillStyle = square.color;
    ctx.fillRect(square.position.x, square.position.y, square.size.width, square.size.height);
    ctx.closePath();
}

export function drawCircle(ctx, circle){
    ctx.beginPath();
    ctx.arc(circle.position.x, circle.position.y, circle.radius, 0, Math.PI*2);
    ctx.fillStyle = circle.color;
    ctx.fill();
    ctx.closePath();
}

function drawImage(ctx, image, x, y, w, h, degrees){
    ctx.save();
    ctx.translate(x+w/2, y+h/2);
    ctx.rotate(degrees*Math.PI/180.0);
    ctx.translate(-x-w/2, -y-h/2);
    ctx.drawImage(image, x, y, w, h);
    ctx.restore();
  }