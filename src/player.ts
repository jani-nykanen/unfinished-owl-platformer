import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { CollisionObject } from "./gameobject.js";
import { Sprite } from "./sprite.js";
import { clamp, State } from "./util.js";
import { Vector2 } from "./vector.js";


export class Player extends CollisionObject {


    private canJump : boolean;
    private jumpTimer : number;
    private jumpMargin : number;

    private sprBody : Sprite;
    private sprFeet : Sprite;
    private eyePos : Vector2;


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

        this.sprBody = new Sprite(32, 24);
        this.sprFeet = new Sprite(16, 8);
        this.eyePos = new Vector2();
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


    private animate(ev : GameEvent) {

        const EPS = 0.01;

        let speed : number;

        this.eyePos.x = 0;
        this.eyePos.y = 0;

        if (Math.abs(this.speed.x) >= 0.5) {

            this.eyePos.x = Math.sign(this.speed.x);
        }

        if (this.canJump) {

            if (Math.abs(this.speed.x) > EPS) {

                speed = 10 - Math.abs(this.speed.x)*4;
                this.sprFeet.animate(3, 1, 4, speed, ev.step);
            }
            else {

                this.sprFeet.setFrame(0, 3);
            }
        }
        else {

            if (Math.abs(this.speed.y) >= 0.5) {

                this.eyePos.y = Math.sign(this.speed.y);
            }
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
        this.animate(ev);
        this.updateTimers(ev);

        this.canJump = false;
    }


    public draw(c : Canvas) {

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);
        
        let bmp = c.getBitmap("owl");

        c.drawSprite(this.sprBody, bmp, px - 16, py - 16);
        c.drawSprite(this.sprFeet, bmp, px - 8, py + 1);

        px += this.eyePos.x;
        py += this.eyePos.y;

        c.setFillColor(0, 0, 0);
        c.fillRect(px - 3, py - 9, 2, 2);
        c.fillRect(px + 1, py - 9, 2, 2);
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
