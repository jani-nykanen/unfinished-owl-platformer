

export class GameState {


    private stars : number;
    private lives : number;
    private gems : number;

    private starsChanged : boolean;
    private livesChanged : boolean;
    private gemsChanged : boolean;


    constructor(startingLives = 5) {

        this.stars = 0;
        this.lives = startingLives;
        this.gems = 0;

        this.starsChanged = false;
        this.livesChanged = false;
        this.gemsChanged = false;
    }


    public update() {

        this.starsChanged = false;
        this.livesChanged = false;
        this.gemsChanged = false;
    }


    public addStar() {

        ++ this.stars;
        this.starsChanged = true;
    }


    public addLives(count) {

        this.lives = Math.max(0, this.lives + count);
        this.livesChanged = true;
    }


    public addGem() {

        ++ this.gems;
        this.gemsChanged = true;
    }


    public hasStarsChanged = () : boolean => this.starsChanged;
    public hasLivesChanged = () : boolean => this.livesChanged;
    public hasGemsChanged = () : boolean => this.gemsChanged;

    public getStarCount = () : number => this.stars;
    public getLifeCount = () : number => this.lives;
    public getGemCount = () : number => this.gems;
}
