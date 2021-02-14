import { Canvas, Flip } from "./canvas.js";
import { GameEvent } from "./core.js";
import { Dust } from "./dust.js";
import { CollisionObject } from "./gameobject.js";
import { GameState } from "./gamestate.js";
import { Sprite } from "./sprite.js";
import { computeFriction, nextObject, State } from "./util.js";
import { Vector2 } from "./vector.js";


export class Player extends CollisionObject {

    private checkpoint : Vector2;

    private canJump : boolean;
    private doubleJump : boolean;
    private jumpTimer : number;
    private jumpMargin : number;
    private stompMargin : number;

    private sprBody : Sprite;
    private sprWing : Sprite;
    private sprFeet : Sprite;
    private eyePos : Vector2;

    private slopeFriction : number;

    private dust : Array<Dust>;
    private dustTimer : number;

    private thumping : boolean;
    private thumpWait : number;

    private flip : Flip;

    private readonly state : GameState;


    constructor(x : number, y : number, state : GameState) {

        super(x, y);

        this.checkpoint = this.pos.clone();

        this.friction = new Vector2(0.125, 0.125);
        this.hitbox = new Vector2(16, 16);
        this.collisionBox = new Vector2(12, 16);
        this.center = new Vector2();

        this.inCamera = true;
        this.canJump = false;
        this.doubleJump = false;
        this.jumpTimer = 0;
        this.jumpMargin = 0;
        this.stompMargin = 0;

        this.sprBody = new Sprite(24, 24);
        this.sprFeet = new Sprite(16, 8);
        this.sprWing = new Sprite(12, 24);
        this.eyePos = new Vector2();
    
        this.dust = new Array<Dust>();
        this.dustTimer = 0;
    
        this.thumping = false;
        this.thumpWait = 0;

        this.flip = Flip.None;

        this.state = state;
    }

    
    private control(ev : GameEvent) {

        const THUMP_EPS = 0.5;
        const BASE_GRAVITY = 3.0;
        const BASE_SPEED = 1.25;
        const JUMP_TIME = 15;
        const DJUMP_TIME = 60;
        const STOMP_BONUS = 8;
        const THUMP_TARGET = 8.0;
        const THUMP_JUMP = -3.0;
        const BASE_Y_FRICTION = 0.125;
        const THUMP_Y_FRICTION = 0.5; 
        
        this.friction.y = BASE_Y_FRICTION;
        if (this.thumping) {

            this.friction.y = THUMP_Y_FRICTION;
            this.target.x = 0;
            this.target.y = THUMP_TARGET;
            return; 
        }

        this.target.x = ev.getStick().x * BASE_SPEED;
        this.target.y = BASE_GRAVITY;

        let s = ev.getAction("fire1");
        let canDoDoubleJump = this.jumpMargin <= 0 && !this.doubleJump;

        if (!this.canJump && ev.getStick().y > THUMP_EPS) {

            this.speed.y = THUMP_JUMP;
            this.thumping = true;
            this.thumpWait = 0;
            return;
        }

        if (this.stompMargin > 0 && (s & State.DownOrPressed) == 1) {

            this.jumpTimer = this.stompMargin + STOMP_BONUS;
            this.stompMargin = 0;
            this.jumpMargin = 0;
        }
        else if ( (this.jumpMargin > 0 || canDoDoubleJump) && 
            s == State.Pressed) {

            if (canDoDoubleJump) {

                this.speed.y = Math.max(this.speed.y, 0);
                this.doubleJump = true;
            }

            this.jumpTimer = canDoDoubleJump ? DJUMP_TIME : JUMP_TIME;
            this.jumpMargin = 0;
        }
        else if (this.jumpTimer > 0 && (s & State.DownOrPressed) == 0) {

            this.jumpTimer = 0;
        }

        this.target.x = computeFriction(this.target.x, 
            this.slopeFriction);
    }


    private animate(ev : GameEvent) {

        const EPS = 0.01;

        let speed : number;
        let bodyFrame : number;
        let wingFrame : number;

        this.eyePos.x = 0;
        this.eyePos.y = 0;

        if (this.thumping) {

            this.sprBody.setFrame(0, 0);
            this.sprFeet.setFrame(1, 7);
            this.sprWing.setFrame(1, 1);

            this.flip = Flip.Vertical;
            return;
        }
        this.flip = Flip.None;

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


    private updateDust(ev : GameEvent) {

        const DUST_TIME = 8;
        const DUST_SPEED = 8;
        const DUST_OFFSET = 4;
        const EPS = 0.1;

        for (let d of this.dust) {

            d.update(ev);
        }

        if (!this.canJump || Math.abs(this.speed.x) <= EPS) {

            this.dustTimer = 0;
            return;
        }            

        if ((this.dustTimer += ev.step) >= DUST_TIME) {

            nextObject<Dust>(this.dust, Dust)   
                .spawn(this.pos.x - Math.sign(this.speed.x) * DUST_OFFSET, 
                    this.pos.y + 6, DUST_SPEED);

            this.dustTimer -= DUST_TIME;
        }
    }


    private updateTimers(ev : GameEvent) {

        const JUMP_SPEED = -2.5;
        const DOUBLE_JUMP_SPEED = -0.225;
        const DOUBLE_JUMP_MIN_SPEED = -1.5;

        if (this.jumpMargin > 0) {

            this.jumpMargin -= ev.step;
        }
        
        if (this.jumpTimer > 0 || this.stompMargin > 0) {

            if (this.jumpTimer > 0)
                this.jumpTimer -= ev.step;
            if (this.stompMargin > 0)
                this.stompMargin -= ev.step;

            if (this.doubleJump)
                this.speed.y = Math.max(DOUBLE_JUMP_MIN_SPEED, 
                    this.speed.y + DOUBLE_JUMP_SPEED * ev.step);
            else
                this.speed.y = JUMP_SPEED;
        }

        if (this.thumping && this.thumpWait > 0) {

            if ((this.thumpWait -= ev.step) <= 0) {

                this.thumping = false;
            }
        }
    }


    protected updateLogic(ev : GameEvent) {

        this.control(ev);
        this.animate(ev);
        this.updateTimers(ev);
        this.updateDust(ev);

        this.canJump = false;
        this.slopeFriction = 0;
    }


    public preDraw(c : Canvas) {

        for (let d of this.dust) {

            d.draw(c);
        }
    }


    public draw(c : Canvas) {

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);

        if (this.flip == Flip.Vertical) {

            py += 4;
        }
        
        let bmp = c.getBitmap("owl");

        // Wings
        c.drawSprite(this.sprWing, bmp, px - 16, py - 16, this.flip);
        c.drawSprite(this.sprWing, bmp, px + 4, py - 16, Flip.Horizontal | this.flip);
        // Body
        c.drawSprite(this.sprBody, bmp, px - 12, py - 16, this.flip);

        // Feet
        let feetPos = py;
        if (this.flip == Flip.Vertical) {

            feetPos -= 18;
        }
        c.drawSprite(this.sprFeet, bmp, px - 8, feetPos + 1, this.flip);

        px += this.eyePos.x;
        py += this.eyePos.y;
        if (this.flip == Flip.Vertical) {

            py += 8;
        }

        // Eyes
        // TODO: "Flip" if horizontal flip
        c.setFillColor(0, 0, 0);
        c.fillRect(px - 3, py - 9, 2, 2);
        c.fillRect(px + 1, py - 9, 2, 2);
    }


    protected slopeCollisionEvent(dir : number, friction : number, ev : GameEvent) {

        const JUMP_MARGIN = 12;
        const THUMP_WAIT = 30;

        if (dir > 0) {

            this.canJump = true;
            this.jumpTimer = 0;
            this.stompMargin = 0;
            this.doubleJump = false;
            this.jumpMargin = JUMP_MARGIN;

            this.slopeFriction = friction;

            if (this.thumping && this.thumpWait <= 0) {

                this.thumpWait = THUMP_WAIT;

                ev.shake(30, 4);
            }
        }
        else {

            this.jumpTimer = 0;
            this.stompMargin = 0;
        }
    }


    public setPosition(x : number, y : number) {

        this.pos = new Vector2(x, y);
        this.oldPos = this.pos.clone();
    }


    public addStar() {

        this.state.addStar();
    }

    
    public getBottom() : number {

        return this.pos.y + this.collisionBox.y/2;
    }


    public setStompMargin(time : number) {

        this.stompMargin = time;
        this.jumpTimer = 0;

        this.doubleJump = false;
    }


    public isThumping = () : boolean => this.thumping;


    public setCheckPoint(p : Vector2) {

        this.checkpoint = p.clone();
    }
}
