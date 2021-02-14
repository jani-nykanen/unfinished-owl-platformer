import { Canvas, Flip } from "./canvas.js";
import { GameEvent } from "./core.js";
import { CollisionObject } from "./gameobject.js";
import { Player } from "./player.js";
import { Sprite } from "./sprite.js";
import { Vector2 } from "./vector.js";


export abstract class Enemy extends CollisionObject {


    protected flip : Flip;
    protected id : number;

    protected renderOffset : Vector2;
    protected slopeFriction : number;
    protected canJump : boolean;


    constructor(x : number, y : number, id = 0) {

        super(x, y);

        this.id = id;
        this.spr = new Sprite(24, 24);
        this.spr.setFrame(0, id);

        // Default values, in the case I forgot to set them
        // separately for each enemy
        this.friction = new Vector2(0.1, 0.1);
        this.hitbox = new Vector2(16, 16);
        this.collisionBox = this.hitbox.clone();

        this.renderOffset = new Vector2();

        this.slopeFriction = 0;
        this.canJump = false;
    }


    protected updateAI(ev : GameEvent) {}


    public updateLogic(ev : GameEvent) {

        this.updateAI(ev);

        this.canJump = false;
        this.slopeFriction = 0;
    }


    public draw(c : Canvas) {

        if (!this.exist || !this.inCamera) 
            return false;

        let bmp = c.getBitmap("enemies");

        let px = Math.round(this.pos.x) + this.renderOffset.x - this.spr.width/2;
        let py = Math.round(this.pos.y) + this.renderOffset.y - this.spr.height/2;

        c.drawSprite(this.spr, bmp, px, py, this.flip);
    }
    

    protected playerEvent(pl : Player, ev : GameEvent) {}


    public playerCollision(pl : Player, ev : GameEvent) : boolean {

        if (this.dying || !this.exist || !this.inCamera) 
            return false;

        this.playerEvent(pl, ev);

        return false;
    }


    protected slopeCollisionEvent(dir : number, friction : number, ev : GameEvent) {

        this.canJump = true;
        this.slopeFriction = friction;
    }

}