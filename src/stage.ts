import { Camera } from "./camera.js";
import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { CollisionObject } from "./gameobject.js";


// For collisions
const COL_DOWN = 0b0001;
const COL_WALL_LEFT = 0b0010;
const COL_WALL_RIGHT = 0b0100;
const COL_UP = 0b1000;


const COLLISION_TABLE = [
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


export class Stage {


    private layers : Array<Array<number>>;
    private collisionMap : Array<number>;
    public readonly width : number;
    public readonly height : number;


    constructor(ev : GameEvent) {

        let baseMap = ev.getTilemap("test");

        this.layers = baseMap.cloneLayers();
        this.collisionMap = ev.getTilemap("collisions").cloneLayer(0);
        this.width = baseMap.width;
        this.height = baseMap.height;
    }


    private getTile(l : number, x : number, y : number, def = 0) : number {

        if (l < 0 || l >= this.layers.length ||
            x < 0 || x >= this.width ||
            y < 0 || y >= this.height)
            return def;

        return this.layers[l][y * this.width + x];
    }


    private getCollisionTile(i : number, def = 0) : number {

        if (i < 0 || i >= this.collisionMap.length)
            return def;

        return this.collisionMap[i];
    }


    public update(ev : GameEvent) {

    }


    public draw(c : Canvas, cam : Camera) {

        let tileset = c.getBitmap("tileset");

        let view = cam.getViewport();

        let startx = Math.floor(view.x / 16) - 1;
        let starty = Math.floor(view.y / 16) - 1;
        let endx = startx + Math.floor(view.w/16) + 2;
        let endy = starty + Math.floor(view.h/16) + 2;

        let sx : number;
        let sy : number;

        let tid : number;
        for (let layer = 0; layer < this.layers.length; ++ layer) {

            for (let y = starty; y < endy; ++ y) {

                for (let x = startx; x < endx; ++ x) {

                    tid = this.getTile(layer, x, y, 0);
                    if (tid <= 0) continue;

                    -- tid;

                    sx = tid % 16;
                    sy = Math.floor(tid / 16);

                    c.drawBitmapRegion(tileset, sx * 16, sy * 16, 16, 16,
                        x*16, y*16);
                }
            }
        }
    }


    private isSlope = (id : number) : boolean => (id >= 17 && id <= 23);


    private handeTileCollision(o : CollisionObject, 
        layer : number, x : number, y : number, 
        colId : number, ev : GameEvent) {

        let c = COLLISION_TABLE[colId];

        let left = this.getCollisionTile(this.getTile(layer, x-1, y)-1);
        let right = this.getCollisionTile(this.getTile(layer, x+1, y)-1);

        let leftMargin = !this.isSlope(left);
        let rightMargin = !this.isSlope(right);

        // Constant surfaces
        if ((c & COL_DOWN) == COL_DOWN) {

            o.constantSlopeCollision(x*16, y*16, 16, 1, leftMargin, rightMargin, ev);
        }
        if ((c & COL_UP) == COL_UP) {

            o.constantSlopeCollision(x*16, (y+1)*16, 16, -1, leftMargin, rightMargin, ev);
        }
        if ((c & COL_WALL_RIGHT) == COL_WALL_RIGHT) {

            o.wallCollision((x+1)*16, y*16, 16, -1, ev);
        }
        if ((c & COL_WALL_LEFT) == COL_WALL_LEFT) {

            o.wallCollision(x*16, y*16, 16, 1, ev);
        }

        // Slopes
        if (colId == 16) {

            o.slopeCollision(x*16, y*16, (x+1)*16, (y+1)*16, 1, ev);
        }
        else if (colId == 17) {

            o.slopeCollision(x*16, (y+1)*16, (x+1)*16, y*16, 1, ev);
        }
        else if (colId == 20) {

            o.slopeCollision(x*16, y*16, (x+1)*16, y*16 + 8, 1, ev);
        }
        else if (colId == 21) {

            o.slopeCollision(x*16, y*16 + 8, (x+1)*16, (y+1)*16, 1, ev);
        }
        else if (colId == 23) {

            o.slopeCollision(x*16, y*16 + 8, (x+1)*16, y*16, 1, ev);
        }
        else if (colId == 22) {

            o.slopeCollision(x*16, (y+1)*16, (x+1)*16, y*16 + 8, 1, ev);
        }
    }


    public objectCollisions(o : CollisionObject, ev : GameEvent) {

        const BOUND_COLLISION_Y_MARGIN = 256;
        const RADIUS = 2;

        if (!o.doesExist()) 
            return;

        let px = Math.floor(o.getPos().x / 16);
        let py = Math.floor(o.getPos().y / 16);

        let tid : number;
        let colId : number;

        for (let layer = 0; layer < this.layers.length; ++ layer) {

            for (let y = py - RADIUS; y <= py + RADIUS; ++ y) {

                for (let x = px - RADIUS; x <= px + RADIUS; ++ x) {

                    tid = this.getTile(layer, x, y);
                    if (tid <= 0) continue;

                    colId = this.getCollisionTile(tid-1);
                    if (colId <= 0) continue;

                    this.handeTileCollision(o,layer,  x, y, colId-1, ev);
                }
            }
        }

        o.wallCollision(0, -BOUND_COLLISION_Y_MARGIN,
            this.height*16 + BOUND_COLLISION_Y_MARGIN*2, -1, ev, 
            true);
        o.wallCollision(this.width*16, -BOUND_COLLISION_Y_MARGIN,
            this.height*16 + BOUND_COLLISION_Y_MARGIN*2, 1, ev, 
            true);
    }


    public restrictCamera(c : Canvas, cam : Camera) {

        cam.restrictCamera(c,
            0, 0, this.width*16, this.height*16);
    }
}
