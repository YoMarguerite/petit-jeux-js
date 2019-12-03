import * as forme from './forme.js';
import * as draw from '../Draw/draw.js';

var Forme = forme.forme;

export class circle extends Forme{
    constructor(position, radius, color){
        super(position, color);
        this.radius = radius;
    }

    collision(x, y){
        return (x>=this.x) && (x<=this.x+this.width) && (y>=this.y) && (y<=this.y+this.height)
    }

    draw(ctx){
        draw.drawCircle(ctx, this);
    }
}