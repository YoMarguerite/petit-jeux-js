class wall{
    constructor(x, y){
        this.origin =[x, y]
        this.points = []
    }

    addPoints(x, y){
        this.points.push([x, y])
    }

    move(dx, dy){
        this.origin.x += dx;
        this.origin.y += dy;
        this.points.forEach((point) => {
            point.x += dx;
            point.y += dy;
        });
    }

    collision(x, y){
        if(points[0] != undefined){
            var pps = this.points;
            pps.shift(this.origin);
            for(let i = 1; i<pps.length; i++){
                if(this.containsPoint(pps[i-1],pps[i],[x, y])){
                    return true;
                }
            }
        }
        return false;
    }

    containsPoint(ext1, ext2, point){
        var res1 = (point.x-ext1.x)/(ext2.x-ext1.x);
        var res2 = (point.y-ext1.y)/(ext2.y-ext1.y);
        if(res1 === res2){
            if((0<=res1)&&(res1<=1)){
                return true;
            }
        }
        return false;
    }
}

function drawWall(wall){
    ctx.beginPath();
    ctx.moveTo(wall.origin[0], wall.origin[1]);
    wall.points.forEach((point) => {
        ctx.lineTo(point[0], point[1])
    });
    ctx.stroke();
}

function initWall(x, y, config){
    var room = new wall(x*config.origin[0], y*config.origin[1]);
    config.points.forEach((point) => {
        room.addPoints(x*point[0], y*point[1])
    });
    return room;
}