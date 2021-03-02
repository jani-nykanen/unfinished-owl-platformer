import { FlyingPiece } from "./flyingpiece.js";
import { Camera } from "./camera.js";
import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { CollisionObject } from "./gameobject.js";
import { ObjectManager } from "./objectmanager.js";
import { nextObject } from "./util.js";
import { Vector2 } from "./vector.js";


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

    private pieces : Array<FlyingPiece>;

    public readonly width : number;
    public readonly height : number;
    public readonly starCount : number;


    constructor(ev : GameEvent) {

        let baseMap = ev.getTilemap("test");

        this.layers = baseMap.cloneLayers();
        this.collisionMap = ev.getTilemap("collisions").cloneLayer(0);
        this.width = baseMap.width;
        this.height = baseMap.height;

        this.pieces = new Array<FlyingPiece> ();

        this.starCount = this.countStars();
    }


    private countStars() : number {

        const STAR_TILES = [258, 58, 59, 74, 75];

        let count = 0;

        for (let l = 0; l < this.layers.length; ++ l) {

            for (let i = 0; i < this.width*this.height; ++ i) {

                if (STAR_TILES.includes((this.layers[l][i])))
                    ++ count;
            }
        }

        return count;
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


    public update(cam : Camera, ev : GameEvent) {

        for (let p of this.pieces) {

            p.cameraCheck(cam);
            p.update(ev);
        }
    }   


    public draw(c : Canvas, cam : Camera) {

        const RADIUS = 2;

        let tileset = c.getBitmap("tileset");

        let view = cam.getViewport();

        let startx = Math.floor(view.x / 16) - RADIUS;
        let starty = Math.floor(view.y / 16) - RADIUS;
        let endx = startx + Math.floor(view.w/16) + RADIUS*2;
        let endy = starty + Math.floor(view.h/16) + RADIUS*2;

        let sx : number;
        let sy : number;

        let tid : number;
        for (let layer = 0; layer < this.layers.length - 1; ++ layer) {

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

        for (let p of this.pieces) {

            p.draw(c);
        }
    }


    private isSlope = (id : number) : boolean => (id >= 17 && id <= 23);


    private handleBaseTileCollision(o : CollisionObject, 
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
    }


    private handleSlopeCollisions(o : CollisionObject, 
        x : number, y : number, 
        colId : number, ev : GameEvent) {

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



    private spawnPieces(x : number, y : number, 
        count : number, speedAmount : number, angleOffset = 0) {

        const BASE_JUMP = -1.25;

        let angle : number;
        let speed : Vector2;

        for (let i = 0; i < count; ++ i) {

            angle = Math.PI * 2 / count * i + angleOffset;

            speed = new Vector2(
                Math.cos(angle) * speedAmount,
                Math.sin(angle) * speedAmount + BASE_JUMP * speedAmount);

            nextObject(this.pieces, FlyingPiece)
                .spawn(x, y, speed, 1, (Math.random() * 4) | 0);
        }
    }


    private handleSpecialTileCollisions(o : CollisionObject, 
        layer : number, x : number, y : number, 
        colId : number, objects : ObjectManager,
        ev : GameEvent) {

        const CHIP_SPEED = 1.75;

        switch(colId) {

        case 32:
        case 33:

            if (o.breakCollision(x*16, y*16, 16, 16, ev)) {

                this.layers[layer][y * this.width + x] = 0;
                this.spawnPieces(x*16 + 8, y*16 + 8, 6, CHIP_SPEED, 0);
                
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
    }


    public objectCollisions(o : CollisionObject, 
        objects : ObjectManager, ev : GameEvent) {

        const BOUND_COLLISION_Y_MARGIN = 256;
        const RADIUS = 2;
        const BASE_TILE_MAX = 16;
        const SLOPE_MAX = 24;

        if (!o.doesExist() || o.isDying() || !o.isInCamera()) 
            return;

        let px = Math.floor(o.getPos().x / 16);
        let py = Math.floor(o.getPos().y / 16);

        let tid : number;
        let colId : number;

        for (let layer = 0; layer < this.layers.length - 1; ++ layer) {

            for (let y = py - RADIUS; y <= py + RADIUS; ++ y) {

                for (let x = px - RADIUS; x <= px + RADIUS; ++ x) {

                    tid = this.getTile(layer, x, y);
                    if (tid <= 0) continue;

                    colId = this.getCollisionTile(tid-1);
                    if (colId <= 0) continue;

                    if (colId <= BASE_TILE_MAX)
                        this.handleBaseTileCollision(o, layer,  x, y, colId-1, ev);
                    
                    else if (colId <= SLOPE_MAX)
                        this.handleSlopeCollisions(o, x, y, colId-1, ev);
                    
                    else
                        this.handleSpecialTileCollisions(o, layer, x, y, 
                            colId-1, objects, ev);
                }
            }
        }

        o.wallCollision(16, -BOUND_COLLISION_Y_MARGIN,
            this.height*16 + BOUND_COLLISION_Y_MARGIN*2, -1, ev, 
            true);
        o.wallCollision((this.width-1)*16, -BOUND_COLLISION_Y_MARGIN,
            this.height*16 + BOUND_COLLISION_Y_MARGIN*2, 1, ev, 
            true);
    }


    public restrictCamera(c : Canvas, cam : Camera) {

        cam.restrictCamera(c,
            16, 0, (this.width-2)*16, (this.height-1)*16);
    }


    public parseObjects(objects : ObjectManager) {

        const FIRST_OBJECT_INDEX = 257;
        const COLLECTIBLE_IDS = [0, 0, 1];

        let tid : number;
        for (let y = 0; y < this.height; ++ y) {

            for (let x = 0; x < this.width; ++ x) {

                tid = this.layers[this.layers.length-1][y * this.width + x];
                if (tid < FIRST_OBJECT_INDEX) continue;

                tid -= FIRST_OBJECT_INDEX;

                switch(tid) {

                // Player
                case 0:

                    objects.setPlayerPosition(x, y);
                    objects.addCheckpoint(x, y, true);
                    break;
                
                // Star
                case 1:
                case 3:

                    objects.addCollectible(x, y, 
                        COLLECTIBLE_IDS[tid-1]);
                    break;

                // Checkpoint
                case 2:
                    
                    objects.addCheckpoint(x, y);
                    break;
                
                default:
                    break;
                }

                if (tid >= 16 && tid < 32) {

                    objects.addEnemy(x, y, tid-16);
                }
            }
        }
    }
}
