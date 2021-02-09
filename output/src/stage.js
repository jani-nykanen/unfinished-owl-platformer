var Stage = /** @class */ (function () {
    function Stage(ev) {
        var baseMap = ev.getTilemap("test");
        this.layers = baseMap.cloneLayers();
        this.width = baseMap.width;
        this.height = baseMap.height;
    }
    Stage.prototype.getTile = function (l, x, y, def) {
        if (def === void 0) { def = 0; }
        if (l < 0 || l >= this.layers.length ||
            x < 0 || x >= this.width ||
            y < 0 || y >= this.height)
            return def;
        return this.layers[l][y * this.width + x];
    };
    Stage.prototype.update = function (ev) {
    };
    Stage.prototype.draw = function (c, cam) {
        var tileset = c.getBitmap("tileset");
        var view = cam.getViewport();
        var startx = Math.floor(view.x / 16) - 1;
        var starty = Math.floor(view.y / 16) - 1;
        var endx = startx + Math.floor(view.w / 16) + 2;
        var endy = starty + Math.floor(view.h / 16) + 2;
        var sx;
        var sy;
        var tid;
        for (var layer = 0; layer < this.layers.length; ++layer) {
            for (var y = starty; y < endy; ++y) {
                for (var x = startx; x < endx; ++x) {
                    tid = this.getTile(layer, x, y, 0);
                    if (tid <= 0)
                        continue;
                    --tid;
                    sx = tid % 16;
                    sy = Math.floor(tid / 16);
                    c.drawBitmapRegion(tileset, sx * 16, sy * 16, 16, 16, x * 16, y * 16);
                }
            }
        }
    };
    return Stage;
}());
export { Stage };
