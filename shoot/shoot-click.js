document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

var interval;
var bool = true;
var coordonne;

function mouseDownHandler(e){
    if(button.collision(coordonne.x, coordonne.y)){
        if(bool){
            clearInterval(int1)
            bool = false;
        }else{
            int1 = setInterval(draw, 10);
            bool = true;
        }
    }else if(gamepad.collision(coordonne.x, coordonne.y)){
        
    }else{    
        click();
        interval = setInterval(click, 500);
    }
}

function mouseUpHandler(e){
    clearInterval(interval)
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

function click(){
    var dx = coordonne.x-hero.x;
    var dy = coordonne.y-hero.y;
    var divise = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
    dx = dx/divise*2;
    dy = dy/divise*2;
    newBall(5, hero.x+(hero.width/2), hero.y+(hero.height/2), dx,dy)
}