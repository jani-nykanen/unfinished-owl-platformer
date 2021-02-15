import { Flip } from "./canvas.js";
import { GameEvent } from "./core.js";
import { Enemy } from "./enemy.js";
import { Player } from "./player.js";
import { computeFriction } from "./util.js";
import { Vector2 } from "./vector.js";


export const getEnemyType = (id : number) : Function =>
    [Turtle, SpikedTurtle, Mushroom, Apple][id];


export class Turtle extends Enemy {

    
    protected dir : number;
    protected oldCanJump : boolean;


    constructor(x : number, y : number) {

        const BASE_GRAVITY = 4.0;

        super(x, y, 0);

        this.dir = (-1 + 2 * ((x / 16 | 0) % 2));

        this.target.y = BASE_GRAVITY;

        this.hitbox = new Vector2(14, 12);
        this.collisionBox = new Vector2(8, 10);

        this.center.y = 4;
        this.knockOffset = 1;

        this.oldCanJump = false;
    }


    protected updateAI(ev : GameEvent) {

        const BASE_SPEED = 0.25;

        if (!this.canJump && this.oldCanJump) {

            this.dir *= -1;
        }
        this.target.x = computeFriction(this.dir * BASE_SPEED, 
            this.slopeFriction);
        this.speed.x = this.target.x;

        if (this.canJump) {

            this.spr.animate(this.id, 0, 3, 6, ev.step);
        }
        this.flip = this.speed.x > 0 ? Flip.Horizontal : Flip.None;

        this.oldCanJump = this.canJump;
    }


    protected wallCollisionEvent(dir : number, ev : GameEvent) {

        this.dir = -dir;
    }


    protected enemyCollisionEvent(dirx : number, diry : number, ev : GameEvent) {

        if (dirx != 0)
            this.dir = -dirx;
    }

}


export class SpikedTurtle extends Turtle {


    constructor(x : number, y : number) {

        super(x, y);

        this.id = 1;
        this.spr.setFrame(0, 1);

        this.canBeStomped = false;
    }
}



export class Mushroom extends Enemy {


    static JUMP_TIME = 60;


    private jumpTimer : number;


    constructor(x : number, y : number) {

        const BASE_GRAVITY = 4.0;

        super(x, y, 2);

        this.target.y = BASE_GRAVITY;
        this.friction.y = 0.1;

        this.jumpTimer = Mushroom.JUMP_TIME + 
            (Mushroom.JUMP_TIME/2) * (((x/16) | 0) % 2);

        this.collisionBox = new Vector2(10, 10);
        this.hitbox = new Vector2(16, 16);
        this.center.y = 4;
        this.renderOffset.y = -2;
        this.knockOffset = 1;

        this.canBeStomped = true;
    }


    protected updateAI(ev : GameEvent) {

        const JUMP_HEIGHT = -3.0;
        const EPS = 0.5;

        let frame : number;

        if (this.canJump) {

            this.spr.setFrame(0, this.id);

            if ((this.jumpTimer -= ev.step) <= 0) {

                this.speed.y = JUMP_HEIGHT;
                this.jumpTimer += Mushroom.JUMP_TIME;
                this.spr.setFrame(1, this.id);
            }
        }
        else {

            frame = 0;
            if (this.speed.y < -EPS)
                frame = 1;
            else if (this.speed.y > EPS)
                frame = 2;

            this.spr.setFrame(frame, this.id);
        }
    }


    protected playerEvent(pl : Player, ev : GameEvent) {

        this.flip = pl.getPos().x > this.pos.x ? Flip.Horizontal : Flip.None;
    }
}


export class Apple extends Enemy {

    
    protected dir : number;
    protected dirDetermined : boolean;
    protected waveTimer : number;


    constructor(x : number, y : number) {

        super(x, y, 3);

        this.hitbox = new Vector2(16, 16);
        this.collisionBox = new Vector2(10, 10);

        this.center.y = 4;
        this.canBeKnocked = false;

        this.waveTimer = 0;

        this.dir = 0;
    }


    protected updateAI(ev : GameEvent) {

        const AMPLITUDE = 4;
        const BASE_SPEED = 0.25;
        const WAVE_SPEED = 0.05;

        this.target.x = this.dir * BASE_SPEED;
        this.speed.x = this.target.x;

        this.spr.animate(this.id, 0, 3, 4, ev.step);
        this.flip = this.speed.x > 0 ? Flip.Horizontal : Flip.None;

        this.waveTimer = (this.waveTimer + WAVE_SPEED*ev.step) % (Math.PI * 2);
        this.pos.y = this.startPos.y + Math.sin(this.waveTimer) * AMPLITUDE;
    }


    protected wallCollisionEvent(dir : number, ev : GameEvent) {

        this.dir = -dir;
    }


    protected enemyCollisionEvent(dirx : number, diry : number, ev : GameEvent) {

        if (dirx != 0)
            this.dir = -dirx;
    }


    protected playerEvent(pl : Player, ev : GameEvent) {

        if (!this.dirDetermined) {

            // We do not use Math.sign here since the value 0
            // is not accepted here
            this.dir = pl.getPos().x > this.pos.x ? 1 : -1;
            this.dirDetermined = true;
        }
    }
}
