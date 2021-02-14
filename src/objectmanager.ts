import { Camera } from "./camera.js";
import { Canvas } from "./canvas.js";
import { Checkpoint } from "./checkpoint.js";
import { GameEvent } from "./core.js";
import { Enemy } from "./enemy.js";
import { getEnemyType } from "./enemytypes.js";
import { GameState } from "./gamestate.js";
import { InteractionTarget } from "./interactiontarget.js";
import { Player } from "./player.js";
import { Stage } from "./stage.js";
import { Star } from "./star.js";


export class ObjectManager {


    private player : Player;
    private stars : Array<Star>;
    private checkpoints : Array<Checkpoint>;
    private enemies : Array<Enemy>;


    constructor(state : GameState) {

        this.player = new Player(0, 0, state);
        this.stars = new Array<Star> ();
        this.enemies = new Array<Enemy> ();
        this.checkpoints = new Array<Checkpoint> ();
    }


    private updateInteractionTargetArray(arr : Array<InteractionTarget>, 
        cam : Camera, ev : GameEvent) {

        for (let a of arr) {

            a.cameraCheck(cam);
            a.update(ev);
            a.playerCollision(this.player, ev);
        }
    }


    public update(cam : Camera, stage : Stage, ev : GameEvent) {
        
        this.updateInteractionTargetArray(this.stars, cam, ev);

        for (let e of this.enemies) {

            e.cameraCheck(cam);
            e.update(ev);
            e.playerCollision(this.player, ev);
            stage.objectCollisions(e, ev);

            if (!e.isDeactivated()) {

                for (let e2 of this.enemies) {

                    if (e2 != e) {

                        e.enemyCollision(e2, ev);
                    }
                }
            }
        }

        this.player.update(ev);
        cam.followObject(this.player, ev);

        stage.objectCollisions(this.player, ev);
    }


    public draw(c : Canvas) {

        for (let e of this.enemies) {

            e.preDraw(c);
        }

        for (let s of this.stars) {

            s.draw(c);
        }

        for (let e of this.enemies) {

            e.draw(c);
        }

        this.player.preDraw(c);
        this.player.draw(c);
    }


    public setCamera(cam : Camera) {

        cam.setPosition(this.player.getPos());
    }


    public setPlayerPosition(x : number, y : number) {

        this.player.setPosition(x*16 + 8, y*16 + 8);
    }


    public addStar(x : number, y : number) {

        this.stars.push(new Star(x*16 + 8, y*16 + 8));
    }


    public addEnemy(x : number, y : number, id : number) {

        this.enemies.push(new (getEnemyType(id))
            .prototype
            .constructor(x*16 + 8, y*16 + 8));
    }
}
