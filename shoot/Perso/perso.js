import * as anime from '../Image/anime.js';

const Anime = anime.anime;

export class perso extends Anime{
    constructor(position, size, images, life, attack, speed){
        super(position, size, images);
        this.life = life;
        this.attack = attack;
        this.speed = speed;
        this.boolFirstAnim = false;
        this.boolSecondAnim = false;
    }

    draw(ctx, mousex){
        ctx.save();
        if(mousex<this.position.x){
            //ctx.translate(this.position.x+(this.size.width/2), this.position.y+(this.size.height/2));
            ctx.rotate(90*Math.PI/180);
        }
        if(this.size != null){
            ctx.drawImage(this.image, this.position.x, this.position.y, this.size.width, this.size.height);
        }else{
            ctx.drawImage(this.image, this.position.x, this.position.y);
        }
        ctx.restore();
    }

    move(coordonnees){
        if((coordonnees.x === 0)&&(coordonnees.y === 0)){
            if(!this.boolFirstAnim){
                this.setAnim([0,1], 250);
                this.boolFirstAnim = true;
                this.boolSecondAnim = false;
            }
        }else{
            if(!this.boolSecondAnim){
                this.setAnim([0,2], 250);
                this.boolFirstAnim = false;
                this.boolSecondAnim = true;
            }
        }
        let dx = coordonnees.x*(this.speed);
        let dy = coordonnees.y*(this.speed);
        this.position.x += dx;
        this.position.y += dy;
    }
}