class anime{
    constructor(images){
        this.image = new Image();
        this.image.src = images[0];
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
        cancelAnimationFrame(this.interval);
        this.interval = requestAnimationFrame(() => {
            let index = this.images.indexOf(this.image.attributes.src.value)+1;
            this.image.src = index<this.anime.length ? this.images[this.anime[index]] : this.images[this.anime[0]];
        }, int);
        return true;
    }
}