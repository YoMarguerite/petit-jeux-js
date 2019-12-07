export default {
    mousepos: {x:0,y:0},
    init(canvas){
        canvas.addEventListener("mousemove", function(evt){
            this.mousepos = {x:evt.x, y:evt.y};
        })
    }
};

