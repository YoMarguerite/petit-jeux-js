import * as forme from './forme.js';
import * as draw from '../Draw/draw.js';

var Forme = forme.forme;

export class quad extends Forme{
    constructor(position, size){
        super(position);
        this.size = size;
    }

    collision(x, y){
        return (x>=this.position.x) &&
        (x<=this.position.x+this.size.width) &&
        (y>=this.position.y) &&
        (y<=this.size.y+this.position.height);
    }

    draw(ctx){
        draw.drawSquare(ctx, this);
    }
}