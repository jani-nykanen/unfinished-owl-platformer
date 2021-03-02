

export class GameState {


    private stars : number;
    private lives : number;

    private starsChanged : boolean;
    private livesChanged : boolean;


    constructor(startingLives = 5) {

        this.stars = 0;
        this.lives = startingLives;

        this.starsChanged = false;
        this.livesChanged = false;
    }


    public update() {

        this.starsChanged = false;
        this.livesChanged = false;
    }


    public addStar() {

        ++ this.stars;

        this.starsChanged = true;
    }


    public addLives(count) {

        this.lives = Math.max(0, this.lives + count);

        this.livesChanged = true;
    }


    public hasStarsChanged = () : boolean => this.starsChanged;
    public hasLivesChanged = () : boolean => this.livesChanged;


    public getStarCount = () : number => this.stars;
    public getLifeCount = () : number => this.lives;
}
