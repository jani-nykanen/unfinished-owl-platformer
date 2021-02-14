import { Camera } from "./camera.js";
import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { Enemy } from "./enemy.js";
import { getEnemyType } from "./enemytypes.js";
import { GameState } from "./gamestate.js";
import { Player } from "./player.js";
import { Stage } from "./stage.js";
import { Star } from "./star.js";


export class ObjectManager {


    private player : Player;
    private stars : Array<Star>;
    private enemies : Array<Enemy>;


    constructor(state : GameState) {

        this.player = new Player(128, 96, state);
        this.stars = new Array<Star> ();
        this.enemies = new Array<Enemy> ();
    }


    public update(cam : Camera, stage : Stage, ev : GameEvent) {
        
        for (let s of this.stars) {

            s.cameraCheck(cam);
            s.update(ev);
            s.playerCollision(this.player, ev);
        }

        // TODO: A class that extends all this methods, so
        // we can just call "updateObjectArray" or something
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
