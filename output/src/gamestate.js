var GameState = /** @class */ (function () {
    function GameState(startingLives) {
        var _this = this;
        if (startingLives === void 0) { startingLives = 5; }
        this.hasStarsChanged = function () { return _this.starsChanged; };
        this.hasLivesChanged = function () { return _this.livesChanged; };
        this.hasGemsChanged = function () { return _this.gemsChanged; };
        this.getStarCount = function () { return _this.stars; };
        this.getLifeCount = function () { return _this.lives; };
        this.getGemCount = function () { return _this.gems; };
        this.stars = 0;
        this.lives = startingLives;
        this.gems = 0;
        this.starsChanged = false;
        this.livesChanged = false;
        this.gemsChanged = false;
    }
    GameState.prototype.update = function () {
        this.starsChanged = false;
        this.livesChanged = false;
        this.gemsChanged = false;
    };
    GameState.prototype.addStar = function () {
        ++this.stars;
        this.starsChanged = true;
    };
    GameState.prototype.addLives = function (count) {
        this.lives = Math.max(0, this.lives + count);
        this.livesChanged = true;
    };
    GameState.prototype.addGem = function () {
        ++this.gems;
        this.gemsChanged = true;
    };
    return GameState;
}());
export { GameState };
