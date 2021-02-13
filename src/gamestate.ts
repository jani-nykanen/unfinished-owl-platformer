

export class GameState {


    private stars : number;
    private changed : boolean;


    constructor() {

        this.stars = 0;
        this.changed = false;
    }


    public update() {

        this.changed = false;
    }


    public addStar() {

        ++ this.stars;
        this.changed = true;
    }


    public hasChanged = () : boolean => this.changed;


    public getStarCount = () : number =>  this.stars;
}
