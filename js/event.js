var boolDown, upPress, downPress, leftPress, rightPress, blur;
boolDown = upPress = downPress = leftPress = rightPress = blur = false;

function onMouseDown(e) {
  if(e.button === 0){
    boolDown = true;
  }
}

function onMouseUp(e) {
  boolDown = false;
}

function keyDown(e){
  if(e.key == "Right" || e.key == "ArrowRight" || e.key.toLowerCase() == "d") {
    rightPress = true;
  }
  else if(e.key == "Left" || e.key == "ArrowLeft" || e.key.toLowerCase() == "q") {
    leftPress = true;
  }else if(e.key == "Up" || e.key == "ArrowUp" || e.key.toLowerCase() == "z") {
    upPress = true;
  }else if(e.key == "Down" || e.key == "ArrowDown" || e.key.toLowerCase() == "s") {
    downPress = true;
  }
}

function keyUp(e){
  if(e.key == "Right" || e.key == "ArrowRight" || e.key.toLowerCase() == "d") {
    rightPress = false;
  }
  else if(e.key == "Left" || e.key == "ArrowLeft" || e.key.toLowerCase() == "q") {
    leftPress = false;
  }else if(e.key == "Up" || e.key == "ArrowUp" || e.key.toLowerCase() == "z") {
    upPress = false;
  }else if(e.key == "Down" || e.key == "ArrowDown" || e.key.toLowerCase() == "s") {
    downPress = false;
  }
}

function onFocus(e){
  blur = false;
}

function onBlur(e){
  blur = true;
}

document.onmousedown = onMouseDown;
document.onmouseup = onMouseUp;
document.onkeydown = keyDown;
document.onkeyup = keyUp;
document.onfocus = onFocus;
document.onblur = onBlur;