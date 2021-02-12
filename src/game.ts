
import { Camera } from "./camera.js";
import { Canvas } from "./canvas.js";
import { GameEvent, Scene } from "./core.js";
import { ObjectManager } from "./objectmanager.js";
import { Stage } from "./stage.js";


export class GameScene implements Scene {


    private cam : Camera;
    private stage : Stage;
    private objects : ObjectManager;

    private cloudPos : Array<number>;


    constructor(param : any, ev : GameEvent) {

        this.cam = new Camera(128, 96);
        this.stage = new Stage(ev);
        this.objects = new ObjectManager();

        this.cloudPos = (new Array<number>(2)).fill(0);
    }


    public refresh(ev : GameEvent) {
        
        const CLOUD_SPEED = [0.125, 0.25];

        this.objects.update(this.cam, this.stage, ev);

        this.stage.update(ev);

        for (let i = 0; i < this.cloudPos.length; ++ i) {

            this.cloudPos[i] = (this.cloudPos[i] + CLOUD_SPEED[i]*ev.step) % 256;
        }
    }


    private drawBackground(c : Canvas) {

        c.drawBitmap(c.getBitmap("sky"), 0, 0);

        let bmpTrees = c.getBitmap("trees");
        let bmpClouds = c.getBitmap("clouds");

        let dx = Math.round(this.cam.getViewport().x / 4) % bmpTrees.width;
        let dy = Math.round(this.cam.getViewport().y / 4) % bmpTrees.height;

        for (let j = 0; j < this.cloudPos.length; ++ j) {

            for (let i = 0; i < 2; ++ i) {

                c.drawBitmapRegion(bmpClouds, 0, bmpClouds.height/2 * j,
                    bmpClouds.width, bmpClouds.height/2, 
                    bmpClouds.width*i - this.cloudPos[j], 16);
            }
        }

        for (let i = 0; i < 3; ++ i) {

            c.drawBitmap(bmpTrees, i*bmpTrees.width - dx, 
                16 + 192 - bmpTrees.height - dy);
        }
    }


    public redraw(c : Canvas) {

        c.moveTo();
        this.drawBackground(c);

        this.cam.computeViewport(c);
        this.stage.restrictCamera(c, this.cam);
        this.cam.use(c);

        this.stage.draw(c, this.cam);
        this.objects.draw(c);

        c.moveTo();
    }


    public dispose() : any {

        return null;
    }
}
