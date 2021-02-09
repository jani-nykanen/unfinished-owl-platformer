
import { Canvas } from "./canvas.js";
import { GameEvent, Scene } from "./core.js";


export class GameScene implements Scene {


    constructor(param : any, ev : GameEvent) {

        // ...
    }


    public refresh(ev : GameEvent) {

    }


    public redraw(c : Canvas) {

        c.clear(170, 170, 170);
    }


    public dispose() : any {

        return null;
    }
}
