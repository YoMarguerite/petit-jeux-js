export class forme{
    constructor(position, color = "#000000"){
        this.position = position;
        this.color = color;
    }

    move(x, y){
        this.position.x = x;
        this.position.y = y;
    }
}