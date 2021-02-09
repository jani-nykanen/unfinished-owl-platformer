// For collisions
var COL_DOWN = 1;
var COL_WALL_LEFT = 2;
var COL_WALL_RIGHT = 4;
var COL_UP = 8;
var COLLISION_TABLE = [
    COL_DOWN,
    COL_WALL_RIGHT,
    COL_UP,
    COL_WALL_LEFT,
    COL_DOWN | COL_UP,
    COL_WALL_LEFT | COL_WALL_RIGHT,
    COL_WALL_LEFT | COL_DOWN,
    COL_WALL_RIGHT | COL_DOWN,
    COL_WALL_RIGHT | COL_UP,
    COL_WALL_LEFT | COL_UP,
    COL_WALL_LEFT | COL_DOWN | COL_WALL_RIGHT,
    COL_WALL_RIGHT | COL_DOWN | COL_UP,
    COL_WALL_LEFT | COL_UP | COL_WALL_RIGHT,
    COL_WALL_LEFT | COL_DOWN | COL_UP,
    COL_WALL_LEFT | COL_DOWN | COL_WALL_RIGHT | COL_UP,
];
var Stage = /** @class */ (function () {
    function Stage(ev) {
        var baseMap = ev.getTilemap("test");
        this.layers = baseMap.cloneLayers();
        this.collisionMap = ev.getTilemap("collisions").cloneLayer(0);
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
    Stage.prototype.getCollisionTile = function (i, def) {
        if (def === void 0) { def = 0; }
        if (i < 0 || i >= this.collisionMap.length)
            return def;
        return this.collisionMap[i];
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
    Stage.prototype.handeTileCollision = function (o, x, y, colId, ev) {
        var c = COLLISION_TABLE[colId];
        if ((c & COL_DOWN) == COL_DOWN) {
            o.constantSlopeCollision(x * 16, y * 16, 16, 1, true, true, ev);
        }
        if ((c & COL_UP) == COL_UP) {
            o.constantSlopeCollision(x * 16, (y + 1) * 16, 16, -1, true, true, ev);
        }
        if ((c & COL_WALL_RIGHT) == COL_WALL_RIGHT) {
            o.wallCollision((x + 1) * 16, y * 16, 16, -1, ev);
        }
        if ((c & COL_WALL_LEFT) == COL_WALL_LEFT) {
            o.wallCollision(x * 16, y * 16, 16, 1, ev);
        }
    };
    Stage.prototype.objectCollisions = function (o, ev) {
        var RADIUS = 2;
        if (!o.doesExist())
            return;
        var px = Math.floor(o.getPos().x / 16);
        var py = Math.floor(o.getPos().y / 16);
        var tid;
        var colId;
        for (var layer = 0; layer < this.layers.length; ++layer) {
            for (var y = py - RADIUS; y <= py + RADIUS; ++y) {
                for (var x = px - RADIUS; x <= px + RADIUS; ++x) {
                    tid = this.getTile(layer, x, y);
                    if (tid <= 0)
                        continue;
                    colId = this.getCollisionTile(tid - 1);
                    if (colId <= 0)
                        continue;
                    this.handeTileCollision(o, x, y, colId - 1, ev);
                }
            }
        }
    };
    Stage.prototype.restrictCamera = function (cam) {
        cam.restrictCamera(0, 0, this.width * 16, this.height * 16);
    };
    return Stage;
}());
export { Stage };
