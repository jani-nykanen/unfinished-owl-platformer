import { Camera } from "./camera.js";
import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { GameState } from "./gamestate.js";
import { Player } from "./player.js";
import { Stage } from "./stage.js";
import { Star } from "./star.js";


export class ObjectManager {


    private player : Player;
    private stars : Array<Star>;


    constructor(state : GameState) {

        this.player = new Player(128, 96, state);
        this.stars = new Array<Star> ();
    }


    public update(cam : Camera, stage : Stage, ev : GameEvent) {
        
        for (let s of this.stars) {

            s.cameraCheck(cam);
            s.update(ev);
            s.playerCollision(this.player);
        }

        this.player.update(ev);
        cam.followObject(this.player, ev);

        stage.objectCollisions(this.player, ev);
    }


    public draw(c : Canvas) {

        for (let s of this.stars) {

            s.draw(c);
        }

        this.player.preDraw(c);
        this.player.draw(c);
    }


    public addStar(x : number, y : number) {

        this.stars.push(new Star(x*16 + 8, y*16 + 8));
    }
}
