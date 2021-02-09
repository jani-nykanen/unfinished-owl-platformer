
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

        c.drawBitmap(c.getBitmap("tileset"), 0, 0);
        c.drawText(c.getBitmap("font"), "Seems to work", 2, 2, 0, 0);
    }


    public dispose() : any {

        return null;
    }
}
