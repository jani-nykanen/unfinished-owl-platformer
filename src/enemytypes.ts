import { Flip } from "./canvas.js";
import { GameEvent } from "./core.js";
import { Enemy } from "./enemy.js";
import { computeFriction } from "./util.js";
import { Vector2 } from "./vector.js";


export const getEnemyType = (id : number) : Function =>
    [Turtle][id];


export class Turtle extends Enemy {

    
    protected dir : number;


    constructor(x : number, y : number) {

        const BASE_GRAVITY = 4.0;

        super(x, y, 0);

        this.dir = (-1 + 2 * ((x / 16 | 0) % 2));

        this.target.y = BASE_GRAVITY;

        this.hitbox = new Vector2(16, 12);
        this.collisionBox = new Vector2(14, 10);

        this.center.y = 4;
    }


    protected updateAI(ev : GameEvent) {

        const BASE_SPEED = 0.25;

        this.target.x = computeFriction(this.dir * BASE_SPEED, this.slopeFriction);
        this.speed.x = this.target.x;

        this.spr.animate(this.id, 0, 3, 6, ev.step);
        this.flip = this.speed.x > 0 ? Flip.Horizontal : Flip.None;
    }


    protected wallCollisionEvent(dir : number, ev : GameEvent) {

        this.target.x = -dir * Math.abs(this.target.x);
        this.speed.x = this.target.x;

        this.dir = -dir;
    }

}
