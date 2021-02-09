import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { CollisionObject } from "./gameobject.js";
import { State } from "./util.js";
import { Vector2 } from "./vector.js";


export class Player extends CollisionObject {


    private canJump : boolean;
    private jumpTimer : number;
    private jumpMargin : number;


    constructor(x : number, y : number) {

        super(x, y);

        this.friction = new Vector2(0.15, 0.15);
        this.hitbox = new Vector2(16, 16);
        this.collisionBox = new Vector2(16, 16);
        this.center = new Vector2();

        this.inCamera = true;
        this.canJump = false;
        this.jumpTimer = 0;
        this.jumpMargin = 0;
    }

    
    private control(ev : GameEvent) {

        const BASE_GRAVITY = 4.0;
        const BASE_SPEED = 1.5;
        const JUMP_TIME = 15;

        this.target.x = ev.getStick().x * BASE_SPEED;
        this.target.y = BASE_GRAVITY;

        let s = ev.getAction("fire1");
        if (this.jumpMargin > 0 && s == State.Pressed) {

            this.jumpTimer = JUMP_TIME;
        }
        else if (this.jumpTimer > 0 && (s & State.DownOrPressed) == 0) {

            this.jumpTimer = 0;
        }
    }


    private updateTimers(ev : GameEvent) {

        const JUMP_SPEED = -3.0;

        if (this.jumpMargin > 0) {

            this.jumpMargin -= ev.step;
        }
        
        if (this.jumpTimer > 0) {

            this.jumpTimer -= ev.step;
            this.speed.y = JUMP_SPEED;
        }
    }


    protected updateLogic(ev : GameEvent) {

        this.control(ev);
        this.updateTimers(ev);

        this.canJump = false;
    }


    public draw(c : Canvas) {

        let px = Math.round(this.pos.x) - 8;
        let py = Math.round(this.pos.y) - 8;

        c.setFillColor(0, 0, 0);
        c.fillRect(px-1, py-1, 18, 18);

        c.setFillColor(255, 0, 0);
        c.fillRect(px, py, 16, 16);
    }


    protected slopeCollisionEvent(dir : number, ev : GameEvent) {

        const JUMP_MARGIN = 10;

        if (dir > 0) {

            this.canJump = true;
            this.jumpMargin = JUMP_MARGIN;
        }
        else {

            this.jumpTimer = 0;
        }
    }
}
