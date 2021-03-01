import { Camera } from "./camera.js";
import { Canvas } from "./canvas.js";
import { Checkpoint } from "./checkpoint.js";
import { GameEvent } from "./core.js";
import { Enemy } from "./enemy.js";
import { getEnemyType } from "./enemytypes.js";
import { WeakGameObject } from "./gameobject.js";
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


    private initialCheckForGameobjectArray(arr : Array<WeakGameObject>, cam : Camera) {

        for (let a of arr) {

            a.cameraCheck(cam);
        }
    }


    public initialCameraCheck(cam : Camera) {

        this.initialCheckForGameobjectArray(this.enemies, cam);
        this.initialCheckForGameobjectArray(this.stars, cam);
        this.initialCheckForGameobjectArray(this.checkpoints, cam);
    }


    public update(cam : Camera, stage : Stage, ev : GameEvent) {
        
        // Static
        this.updateInteractionTargetArray(this.stars, cam, ev);
        this.updateInteractionTargetArray(this.checkpoints, cam, ev);

        // Player
        this.player.specialCameraCheck(cam);
        this.player.update(ev);
        cam.followObject(this.player, ev);
        stage.objectCollisions(this.player, this, ev);
        this.player.bodypieceCollisions(stage, ev);

        // Enemies
        for (let e of this.enemies) {

            e.cameraCheck(cam);
            e.update(ev);
            e.playerCollision(this.player, ev);
            stage.objectCollisions(e, null, ev);

            if (!e.isDeactivated()) {

                for (let e2 of this.enemies) {

                    if (e2 != e) {

                        e.enemyCollision(e2, ev);
                    }
                }
            }
        }
    }


    public draw(c : Canvas) {

        for (let e of this.enemies) {

            e.preDraw(c);
        }

        for (let s of this.stars) {

            s.draw(c);
        }

        for (let o of this.checkpoints) {

            o.draw(c);
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


    public addStar(x : number, y : number, isOneUp = false) {

        this.stars.push(new Star(x*16 + 8, y*16 + 8, isOneUp));
    }


    public addCheckpoint(x : number, y : number, makeActive = false) {

        this.checkpoints.push(new Checkpoint(x*16 + 8, y*16 + 8, makeActive));
    }


    public addEnemy(x : number, y : number, id : number) {

        let type = getEnemyType(id);
        if (type == null) return;

        this.enemies.push(new (getEnemyType(id))
            .prototype
            .constructor(x*16 + 8, y*16 + 8));
    }
}
