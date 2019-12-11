var boolDown, upPress, downPress, leftPress, rightPress;
boolDown = upPress = downPress = leftPress = rightPress = false;

function onMouseDown(e) {
  boolDown = true;
}

function onMouseUp(e) {
  boolDown = false;
}

function keyDown(e){
  if(e.key == "Right" || e.key == "ArrowRight") {
    rightPress = true;
  }
  else if(e.key == "Left" || e.key == "ArrowLeft") {
    leftPress = true;
  }else if(e.key == "Up" || e.key == "ArrowUp") {
    upPress = true;
  }else if(e.key == "Down" || e.key == "ArrowDown") {
    downPress = true;
  }
}

function keyUp(e){
  if(e.key == "Right" || e.key == "ArrowRight") {
    rightPress = false;
  }
  else if(e.key == "Left" || e.key == "ArrowLeft") {
    leftPress = false;
  }else if(e.key == "Up" || e.key == "ArrowUp") {
    upPress = false;
  }else if(e.key == "Down" || e.key == "ArrowDown") {
    downPress = false;
  }
}

document.onmousedown = onMouseDown;
document.onmouseup = onMouseUp;
document.onkeydown = keyDown;
document.onkeyup = keyUp;