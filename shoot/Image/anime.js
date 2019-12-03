import * as image from './image.js';

const Image = image.image;

export class anime extends Image{
    constructor(position, size, images){
        super(position, size, images[0]);
        this.images = images;
        this.interval = null;
        this.anime = null;
    }

    setAnim(anime, int){
        if((anime.length === 0) && (int > 0)){
            return false;
        }
        if((anime.filter((a) => {
            if(this.images[a] == null){
                
                return true;
            }
            return false;
        })).length != 0){
            return false;
        };
        this.anime = anime;
        this.image.src = this.images[this.anime[0]];
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            let index = this.images.indexOf(this.image.attributes.src.value)+1;
            this.image.src = index<this.anime.length ? this.images[this.anime[index]] : this.images[this.anime[0]];
        }, int);
        return true;
    }

    draw(ctx){
        if(this.size != null){
            ctx.drawImage(this.image, this.position.x, this.position.y, this.size.width, this.size.height);
        }else{
            ctx.drawImage(this.image, this.position.x, this.position.y);
        }
    }
}