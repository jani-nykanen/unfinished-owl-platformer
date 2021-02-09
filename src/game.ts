
import { Camera } from "./camera.js";
import { Canvas } from "./canvas.js";
import { GameEvent, Scene } from "./core.js";
import { Stage } from "./stage.js";


export class GameScene implements Scene {


    private cam : Camera;
    private stage : Stage;


    constructor(param : any, ev : GameEvent) {

        this.cam = new Camera(128, 96);
        this.stage = new Stage(ev);
    }


    public refresh(ev : GameEvent) {

        this.stage.update(ev);
    }


    public redraw(c : Canvas) {

        c.clear(170, 170, 170);

        this.cam.use(c);

        this.stage.draw(c, this.cam);

        c.moveTo();
    }


    public dispose() : any {

        return null;
    }
}
