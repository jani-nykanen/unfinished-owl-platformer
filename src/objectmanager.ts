import { Camera } from "./camera.js";
import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { Player } from "./player.js";
import { Stage } from "./stage.js";


export class ObjectManager {


    private player : Player;


    constructor() {

        this.player = new Player(128, 96);
    }


    public update(cam : Camera, stage : Stage, ev : GameEvent) {

        this.player.update(ev);
        cam.followObject(this.player, ev);

        stage.objectCollisions(this.player, ev);
    }


    public draw(c : Canvas) {

        this.player.draw(c);
    }
}
