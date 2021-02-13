var GameState = /** @class */ (function () {
    function GameState() {
        var _this = this;
        this.hasChanged = function () { return _this.changed; };
        this.getStarCount = function () { return _this.stars; };
        this.stars = 0;
        this.changed = false;
    }
    GameState.prototype.update = function () {
        this.changed = false;
    };
    GameState.prototype.addStar = function () {
        ++this.stars;
        this.changed = true;
    };
    return GameState;
}());
export { GameState };
