import { Canvas, Flip } from "./canvas.js";
import { GameEvent } from "./core.js";
import { CollisionObject } from "./gameobject.js";
import { Sprite } from "./sprite.js";
import { clamp, State } from "./util.js";
import { Vector2 } from "./vector.js";


export class Player extends CollisionObject {


    private canJump : boolean;
    private doubleJump : boolean;
    private jumpTimer : number;
    private jumpMargin : number;

    private sprBody : Sprite;
    private sprWing : Sprite;
    private sprFeet : Sprite;
    private eyePos : Vector2;

    private slopeFriction : number;


    constructor(x : number, y : number) {

        super(x, y);

        this.friction = new Vector2(0.125, 0.125);
        this.hitbox = new Vector2(16, 16);
        this.collisionBox = new Vector2(12, 16);
        this.center = new Vector2();

        this.inCamera = true;
        this.canJump = false;
        this.doubleJump = false;
        this.jumpTimer = 0;
        this.jumpMargin = 0;

        this.sprBody = new Sprite(24, 24);
        this.sprFeet = new Sprite(16, 8);
        this.sprWing = new Sprite(12, 24);
        this.eyePos = new Vector2();
    }

    
    private control(ev : GameEvent) {

        const BASE_GRAVITY = 3.0;
        const BASE_SPEED = 1.25;
        const JUMP_TIME = 15;
        const DJUMP_TIME = 60;

        this.target.x = ev.getStick().x * BASE_SPEED;
        this.target.y = BASE_GRAVITY;

        let s = ev.getAction("fire1");
        let canDoDoubleJump = this.jumpMargin <= 0 && !this.doubleJump;

        if ( (this.jumpMargin > 0 || canDoDoubleJump) && 
            s == State.Pressed) {

            this.jumpTimer = canDoDoubleJump ? DJUMP_TIME : JUMP_TIME;

            if (canDoDoubleJump) {

                this.speed.y = Math.max(this.speed.y, 0);
                this.doubleJump = true;
            }
        }
        else if (this.jumpTimer > 0 && (s & State.DownOrPressed) == 0) {

            this.jumpTimer = 0;
        }

        // Not quite working yet
        if (Math.abs(this.slopeFriction) > 0) {

            // this.target.x *= Math.abs(this.slopeFriction);
        }
    }


    private animate(ev : GameEvent) {

        const EPS = 0.01;

        let speed : number;
        let bodyFrame : number;
        let wingFrame : number;

        this.eyePos.x = 0;
        this.eyePos.y = 0;

        if (Math.abs(this.speed.x) >= 0.5) {

            this.eyePos.x = Math.sign(this.speed.x);
        }

        if (this.canJump) {

            if (Math.abs(this.speed.x) > EPS) {

                speed = 10 - Math.abs(this.speed.x)*4;
                this.sprFeet.animate(6, 1, 4, speed, ev.step);
            }
            else {

                this.sprFeet.setFrame(0, 6);
            }

            this.sprBody.setFrame(0, 0);
            this.sprWing.setFrame(0, 1);
        }
        else {  

            bodyFrame = 0;
            wingFrame = 2;
            if (Math.abs(this.speed.y) >= 0.5) {

                this.eyePos.y = Math.sign(this.speed.y) * 2;
                bodyFrame = this.speed.y < 0 ? 1 : 2;
                wingFrame = this.speed.y < 0 ? 1 : 3;
            }
            this.sprBody.setFrame(bodyFrame, 0);
            this.sprFeet.setFrame(bodyFrame, 7);

            if (!this.doubleJump || this.jumpTimer <= 0) {

                this.sprWing.setFrame(wingFrame, 1);
            }
            else {

                this.sprWing.animate(1, 1, 4, 4, ev.step);
            }
        }
    }


    private updateTimers(ev : GameEvent) {

        const JUMP_SPEED = -2.5;
        const DOUBLE_JUMP_SPEED = -0.225;
        const DOUBLE_JUMP_MIN_SPEED = -1.5;

        if (this.jumpMargin > 0) {

            this.jumpMargin -= ev.step;
        }
        
        if (this.jumpTimer > 0) {

            this.jumpTimer -= ev.step;

            if (this.doubleJump)
                this.speed.y = Math.max(DOUBLE_JUMP_MIN_SPEED, 
                    this.speed.y + DOUBLE_JUMP_SPEED * ev.step);
            else
                this.speed.y = JUMP_SPEED;
        }
    }


    protected updateLogic(ev : GameEvent) {

        this.control(ev);
        this.animate(ev);
        this.updateTimers(ev);

        this.canJump = false;
        this.slopeFriction = 0;
    }


    public draw(c : Canvas) {

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);
        
        let bmp = c.getBitmap("owl");

        // Wings
        c.drawSprite(this.sprWing, bmp, px - 16, py - 16);
        c.drawSprite(this.sprWing, bmp, px + 4, py - 16, Flip.Horizontal);
        // Body
        c.drawSprite(this.sprBody, bmp, px - 12, py - 16);
        // Feet
        c.drawSprite(this.sprFeet, bmp, px - 8, py + 1);

        px += this.eyePos.x;
        py += this.eyePos.y;

        // Eyes
        c.setFillColor(0, 0, 0);
        c.fillRect(px - 3, py - 9, 2, 2);
        c.fillRect(px + 1, py - 9, 2, 2);
    }


    protected slopeCollisionEvent(dir : number, friction : number, ev : GameEvent) {

        const JUMP_MARGIN = 12;

        if (dir > 0) {

            this.canJump = true;
            this.jumpTimer = 0;
            this.doubleJump = false;
            this.jumpMargin = JUMP_MARGIN;

            this.slopeFriction = friction;

        }
        else {

            this.jumpTimer = 0;
        }
    }
}
