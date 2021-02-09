
import { Camera } from "./camera.js";
import { Canvas } from "./canvas.js";
import { GameEvent, Scene } from "./core.js";
import { ObjectManager } from "./objectmanager.js";
import { Stage } from "./stage.js";


export class GameScene implements Scene {


    private cam : Camera;
    private stage : Stage;
    private objects : ObjectManager;


    constructor(param : any, ev : GameEvent) {

        this.cam = new Camera(128, 96);
        this.stage = new Stage(ev);
        this.objects = new ObjectManager();
    }


    public refresh(ev : GameEvent) {
        
        this.objects.update(this.cam, this.stage, ev);

        this.stage.update(ev);
    }


    public redraw(c : Canvas) {

        c.clear(85, 85, 85);

        this.cam.computeViewport(c);
        this.stage.restrictCamera(this.cam);
        this.cam.use(c);

        this.stage.draw(c, this.cam);
        this.objects.draw(c);

        c.moveTo();
    }


    public dispose() : any {

        return null;
    }
}
