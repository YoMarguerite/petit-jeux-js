document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

var clickInt, moveInt, shootInt, waitInt, waiter = false;
var bool = true;
var coordonne;

function mouseDownHandler(e){
    if(button.collision(coordonne.x, coordonne.y)){

        if(bool){
            clearInterval(intDraw)
            bool = false;
        }else{
            intDraw = setInterval(draw, 10);
            bool = true;
        }

    }else if(gamepad.collision(coordonne.x, coordonne.y)){

        moveInt = setInterval(heroMove, 10)

    }else if(shooter.collision(coordonne.x, coordonne.y)){
        
        if(waiter === false){
            shooterBall();
            waiter = true;
            setTimeout(wait,500);
        }
        shootInt = setInterval(shooterMove, 10);
        clickInt = setInterval(shooterBall, 500);

    }else{  

        if(waiter === false){
            clickBall();
            waiter = true;
            setTimeout(wait,500);
        }
        clickInt = setInterval(clickBall, 500);
    }
}

function mouseUpHandler(e){
    clearInterval(moveInt);
    gamepad.reset();
    clearInterval(shootInt);
    shooter.reset();
    clearInterval(clickInt);
}

function mouseMoveHandler(e){
    coordonne = getCoords(canvas, e);
}

function getCoords(el,event) {
  var ox = -el.offsetLeft,
  oy = -el.offsetTop;
  while(el=el.offsetParent){
    ox += el.scrollLeft - el.offsetLeft;
    oy += el.scrollTop - el.offsetTop;
  }
  return {x:event.clientX + ox , y:event.clientY + oy};
}

function calculD(){
    var dx = coordonne.x-hero.x;
    var dy = coordonne.y-hero.y;
    var divise = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
    dx = dx/divise;
    dy = dy/divise;
    return [dx, dy];
}

function clickBall(){
    var tab = calculD();
    newBall(config.ball, hero.x+(hero.width/2), hero.y+(hero.height/2), tab[0],tab[1])
}

function heroMove(){
    var tab = gamepad.move(coordonne.x, coordonne.y);
    hero.move(tab[0], tab[1]);
}

function shooterMove(){
    return shooter.move(coordonne.x, coordonne.y);
}

function shooterBall(){
    var tab = shooterMove();
    newBall(config.ball, hero.x+(hero.width/2), hero.y+(hero.height/2), tab[0],tab[1])
}

function wait(){
    waiter = false;
}