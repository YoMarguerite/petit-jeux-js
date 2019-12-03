import * as quad from './quad.js';
import * as draw from '../Draw/draw.js';

var Quad = quad.quad;

export class square extends Quad{
    constructor(position, size, color = "#000000"){
        super(position, size);
        this.color = color;
    }

    draw(ctx){
        draw.drawSquare(ctx, this);
    }
}