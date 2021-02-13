var GameState = /** @class */ (function () {
    function GameState() {
        var _this = this;
        this.getStarCount = function () { return _this.stars; };
        this.stars = 0;
    }
    GameState.prototype.addStar = function () {
        ++this.stars;
    };
    return GameState;
}());
export { GameState };
