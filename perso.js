class perso extends Anime{
    constructor(position, images, life, attack, speed){
        super(images);
        this.position = position;
        this.life = life;
        this.attack = attack;
        this.speed = speed;
        this.boolFirstAnim = false;
        this.boolSecondAnim = false;
        this.weapon = null;
        this.weapons = [];
    }

    move(coordonnees, mouse){
        if(mouse > this.position.x){
            this.position.scale = 1;
        }else{
            this.position.scale = -1;
        }
        if((coordonnees.x === 0)&&(coordonnees.y === 0)){
            if(!this.boolFirstAnim){
                this.setAnim([0,1], 250);
                this.boolFirstAnim = true;
                this.boolSecondAnim = false;
            }
        }else{
            if(!this.boolSecondAnim){
                this.setAnim([0,2], 200);
                this.boolFirstAnim = false;
                this.boolSecondAnim = true;
            }
        }
        let dx = coordonnees.x*(this.speed);
        let dy = coordonnees.y*(this.speed);
        this.position.x += dx;
        this.position.y += dy;
        return this.position;
    }
}

console.log(perso)