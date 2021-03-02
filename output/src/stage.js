import { FlyingPiece } from "./flyingpiece.js";
import { nextObject } from "./util.js";
import { Vector2 } from "./vector.js";
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
        this.isSlope = function (id) { return (id >= 17 && id <= 23); };
        var baseMap = ev.getTilemap("test");
        this.layers = baseMap.cloneLayers();
        this.collisionMap = ev.getTilemap("collisions").cloneLayer(0);
        this.width = baseMap.width;
        this.height = baseMap.height;
        this.pieces = new Array();
        this.starCount = this.countStars();
    }
    Stage.prototype.countStars = function () {
        var STAR_TILES = [258, 58, 59, 74, 75];
        var count = 0;
        for (var l = 0; l < this.layers.length; ++l) {
            for (var i = 0; i < this.width * this.height; ++i) {
                if (STAR_TILES.includes((this.layers[l][i])))
                    ++count;
            }
        }
        return count;
    };
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
    Stage.prototype.update = function (cam, ev) {
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var p = _a[_i];
            p.cameraCheck(cam);
            p.update(ev);
        }
    };
    Stage.prototype.draw = function (c, cam) {
        var RADIUS = 2;
        var tileset = c.getBitmap("tileset");
        var view = cam.getViewport();
        var startx = Math.floor(view.x / 16) - RADIUS;
        var starty = Math.floor(view.y / 16) - RADIUS;
        var endx = startx + Math.floor(view.w / 16) + RADIUS * 2;
        var endy = starty + Math.floor(view.h / 16) + RADIUS * 2;
        var sx;
        var sy;
        var tid;
        for (var layer = 0; layer < this.layers.length - 1; ++layer) {
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
        for (var _i = 0, _a = this.pieces; _i < _a.length; _i++) {
            var p = _a[_i];
            p.draw(c);
        }
    };
    Stage.prototype.handleBaseTileCollision = function (o, layer, x, y, colId, ev) {
        var c = COLLISION_TABLE[colId];
        var left = this.getCollisionTile(this.getTile(layer, x - 1, y) - 1);
        var right = this.getCollisionTile(this.getTile(layer, x + 1, y) - 1);
        var leftMargin = !this.isSlope(left);
        var rightMargin = !this.isSlope(right);
        // Constant surfaces
        if ((c & COL_DOWN) == COL_DOWN) {
            o.constantSlopeCollision(x * 16, y * 16, 16, 1, leftMargin, rightMargin, ev);
        }
        if ((c & COL_UP) == COL_UP) {
            o.constantSlopeCollision(x * 16, (y + 1) * 16, 16, -1, leftMargin, rightMargin, ev);
        }
        if ((c & COL_WALL_RIGHT) == COL_WALL_RIGHT) {
            o.wallCollision((x + 1) * 16, y * 16, 16, -1, ev);
        }
        if ((c & COL_WALL_LEFT) == COL_WALL_LEFT) {
            o.wallCollision(x * 16, y * 16, 16, 1, ev);
        }
    };
    Stage.prototype.handleSlopeCollisions = function (o, x, y, colId, ev) {
        if (colId == 16) {
            o.slopeCollision(x * 16, y * 16, (x + 1) * 16, (y + 1) * 16, 1, ev);
        }
        else if (colId == 17) {
            o.slopeCollision(x * 16, (y + 1) * 16, (x + 1) * 16, y * 16, 1, ev);
        }
        else if (colId == 20) {
            o.slopeCollision(x * 16, y * 16, (x + 1) * 16, y * 16 + 8, 1, ev);
        }
        else if (colId == 21) {
            o.slopeCollision(x * 16, y * 16 + 8, (x + 1) * 16, (y + 1) * 16, 1, ev);
        }
        else if (colId == 23) {
            o.slopeCollision(x * 16, y * 16 + 8, (x + 1) * 16, y * 16, 1, ev);
        }
        else if (colId == 22) {
            o.slopeCollision(x * 16, (y + 1) * 16, (x + 1) * 16, y * 16 + 8, 1, ev);
        }
    };
    Stage.prototype.spawnPieces = function (x, y, count, speedAmount, angleOffset) {
        if (angleOffset === void 0) { angleOffset = 0; }
        var BASE_JUMP = -1.25;
        var angle;
        var speed;
        for (var i = 0; i < count; ++i) {
            angle = Math.PI * 2 / count * i + angleOffset;
            speed = new Vector2(Math.cos(angle) * speedAmount, Math.sin(angle) * speedAmount + BASE_JUMP * speedAmount);
            nextObject(this.pieces, FlyingPiece)
                .spawn(x, y, speed, 1, (Math.random() * 4) | 0);
        }
    };
    Stage.prototype.handleSpecialTileCollisions = function (o, layer, x, y, colId, objects, ev) {
        var CHIP_SPEED = 1.75;
        switch (colId) {
            case 32:
            case 33:
                if (o.breakCollision(x * 16, y * 16, 16, 16, ev)) {
                    this.layers[layer][y * this.width + x] = 0;
                    this.spawnPieces(x * 16 + 8, y * 16 + 8, 6, CHIP_SPEED, 0);
                    if (objects != null && colId == 33) {
                        objects.addCollectible(x, y, 0);
                    }
                    return;
                }
                this.handleBaseTileCollision(o, layer, x, y, 14, ev);
                break;
            default:
                break;
        }
    };
    Stage.prototype.objectCollisions = function (o, objects, ev) {
        var BOUND_COLLISION_Y_MARGIN = 256;
        var RADIUS = 2;
        var BASE_TILE_MAX = 16;
        var SLOPE_MAX = 24;
        if (!o.doesExist() || o.isDying() || !o.isInCamera())
            return;
        var px = Math.floor(o.getPos().x / 16);
        var py = Math.floor(o.getPos().y / 16);
        var tid;
        var colId;
        for (var layer = 0; layer < this.layers.length - 1; ++layer) {
            for (var y = py - RADIUS; y <= py + RADIUS; ++y) {
                for (var x = px - RADIUS; x <= px + RADIUS; ++x) {
                    tid = this.getTile(layer, x, y);
                    if (tid <= 0)
                        continue;
                    colId = this.getCollisionTile(tid - 1);
                    if (colId <= 0)
                        continue;
                    if (colId <= BASE_TILE_MAX)
                        this.handleBaseTileCollision(o, layer, x, y, colId - 1, ev);
                    else if (colId <= SLOPE_MAX)
                        this.handleSlopeCollisions(o, x, y, colId - 1, ev);
                    else
                        this.handleSpecialTileCollisions(o, layer, x, y, colId - 1, objects, ev);
                }
            }
        }
        o.wallCollision(16, -BOUND_COLLISION_Y_MARGIN, this.height * 16 + BOUND_COLLISION_Y_MARGIN * 2, -1, ev, true);
        o.wallCollision((this.width - 1) * 16, -BOUND_COLLISION_Y_MARGIN, this.height * 16 + BOUND_COLLISION_Y_MARGIN * 2, 1, ev, true);
    };
    Stage.prototype.restrictCamera = function (c, cam) {
        cam.restrictCamera(c, 16, 0, (this.width - 2) * 16, (this.height - 1) * 16);
    };
    Stage.prototype.parseObjects = function (objects) {
        var FIRST_OBJECT_INDEX = 257;
        var COLLECTIBLE_IDS = [0, 0, 1, 2];
        var tid;
        for (var y = 0; y < this.height; ++y) {
            for (var x = 0; x < this.width; ++x) {
                tid = this.layers[this.layers.length - 1][y * this.width + x];
                if (tid < FIRST_OBJECT_INDEX)
                    continue;
                tid -= FIRST_OBJECT_INDEX;
                switch (tid) {
                    // Player
                    case 0:
                        objects.setPlayerPosition(x, y);
                        objects.addCheckpoint(x, y, true);
                        break;
                    // Star
                    case 1:
                    case 3:
                    case 4:
                        objects.addCollectible(x, y, COLLECTIBLE_IDS[tid - 1]);
                        break;
                    // Checkpoint
                    case 2:
                        objects.addCheckpoint(x, y);
                        break;
                    default:
                        break;
                }
                if (tid >= 16 && tid < 32) {
                    objects.addEnemy(x, y, tid - 16);
                }
            }
        }
    };
    return Stage;
}());
export { Stage };
