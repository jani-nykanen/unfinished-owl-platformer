

export class GameState {


    private stars : number;


    constructor() {

        this.stars = 0;
    }


    public addStar() {

        ++ this.stars;
    }


    public getStarCount = () : number =>  this.stars;
}
