import { Camera } from "./camera.js";
import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";


export class Stage {


    private layers : Array<Array<number>>;
    public readonly width : number;
    public readonly height : number;


    constructor(ev : GameEvent) {

        let baseMap = ev.getTilemap("test");

        this.layers = baseMap.cloneLayers();
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
}
