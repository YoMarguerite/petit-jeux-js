import * as quad from '../Geometry/quad.js';

var Quad = quad.quad;

export class image extends Quad{
    constructor(position, size, image){
        super(position, size);
        this.image = new Image();
        this.image.src = image;
    }

    draw(ctx){
        if(this.size != null){
            ctx.drawImage(this.image, this.position.x, this.position.y, this.size.width, this.size.height);
        }else{
            ctx.drawImage(this.image, this.position.x, this.position.y);
        }
    }
}