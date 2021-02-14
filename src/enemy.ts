import { Canvas, Flip } from "./canvas.js";
import { GameEvent } from "./core.js";
import { CollisionObject } from "./gameobject.js";
import { Particle } from "./particle.js";
import { Player } from "./player.js";
import { Sprite } from "./sprite.js";
import { nextObject } from "./util.js";
import { Vector2 } from "./vector.js";


const ENEMY_DEATH_TIME = 32;


export abstract class Enemy extends CollisionObject {


    protected flip : Flip;
    protected id : number;

    protected renderOffset : Vector2;
    protected slopeFriction : number;
    protected canJump : boolean;

    protected particles : Array<Particle>;
    protected deathTime : number;

    protected canBeKnocked : boolean;
    protected knockTimer : number;
    protected knockOffset : number;


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

        this.particles = new Array<Particle> ();
        this.deathTime = 0;

        this.canBeKnocked = true;
        this.knockTimer = 0;
        this.knockOffset = 0;
    }

    
    public isDeactivated = () : boolean => (this.dying || !this.exist || !this.inCamera);


    protected updateAI(ev : GameEvent) {}


    protected die(ev : GameEvent) : boolean {

        for (let p of this.particles) {

            p.update(ev);
        }

        return (this.deathTime -= ev.step) <= 0;
    }


    public updateLogic(ev : GameEvent) {

        const KNOCK_TIME = 120;
        const KNOCK_JUMP = -2.0;

        if (this.knockTimer > 0) {

            this.knockTimer -= ev.step;
            return;
        }

        if (this.canBeKnocked &&
            ev.isShaking() && this.canJump) {

            this.target.x = 0;
            this.speed.y = KNOCK_JUMP;
            this.knockTimer = KNOCK_TIME;

            return;
        }

        this.updateAI(ev);

        this.canJump = false;
        this.slopeFriction = 0;
    }


    public preDraw(c : Canvas) {

        if (!this.exist || !this.dying) return;

        for (let p of this.particles) {

            p.draw(c);
        }
    }


    public draw(c : Canvas) {

        if (this.isDeactivated())
            return;

        let bmp = c.getBitmap("enemies");

        let px = Math.round(this.pos.x) + this.renderOffset.x - this.spr.width/2;
        let py = Math.round(this.pos.y) + this.renderOffset.y - this.spr.height/2;

        let flip = this.flip;
        if (this.knockTimer > 0) {
            
            flip |= Flip.Vertical;

            py += this.center.y + this.knockOffset;
        }

        c.drawSprite(this.spr, bmp, px, py, flip);
    }
    

    protected playerEvent(pl : Player, ev : GameEvent) {}


    private spawnParticles(count : number, speedAmount : number, angleOffset = 0) {

        const ANIM_SPEED = 4.0;

        let angle : number;
        let speed : Vector2;

        for (let i = 0; i < count; ++ i) {

            angle = Math.PI * 2 / count * i + angleOffset;

            speed = new Vector2(
                Math.cos(angle) * speedAmount,
                Math.sin(angle) * speedAmount);

            nextObject(this.particles, Particle)
                .spawn(this.pos.x, this.pos.y, speed, 
                    ENEMY_DEATH_TIME-1, ANIM_SPEED,
                    0, 1);
        }
    }


    public playerCollision(pl : Player, ev : GameEvent) : boolean {

        const STOMP_MARGIN = 8;
        const STOMP_MARGIN_TIME = 8;

        if (this.isDeactivated()) 
            return false;

        this.playerEvent(pl, ev);

        // Stomp
        let top = this.pos.y + this.center.y - this.collisionBox.y/2;
        let py = pl.getBottom();

        let hbox = pl.getHitbox();
        let px = pl.getPos().x;

        if (pl.getSpeed().y >= this.speed.y &&
            px + hbox.x/2 >= this.pos.x - this.hitbox.x/2 &&
            px - hbox.x/2 < this.pos.x + this.hitbox.x/2 &&
            py >= top && 
            py < top + (STOMP_MARGIN + Math.max(0, this.speed.y))*ev.step) {

            if (!pl.isThumping())
                pl.setStompMargin(STOMP_MARGIN_TIME);
            
            this.dying = true;
            this.deathTime = ENEMY_DEATH_TIME;
            this.spawnParticles(6, 1.5);
        }

        return false;
    }


    protected enemyCollisionEvent(dirx : number, diry : number, ev : GameEvent) {};


    public enemyCollision(e : Enemy, ev : GameEvent) : boolean {

        if (this.isDeactivated() || e.isDeactivated())
            return false;

        if (this.overlayObject(e)) {

            this.enemyCollisionEvent(
                Math.sign(e.pos.x - this.pos.x), 
                Math.sign(e.pos.y - this.pos.y), ev);
            return true;
        }

        return false;
    }


    protected slopeCollisionEvent(dir : number, friction : number, ev : GameEvent) {

        this.canJump = true;
        this.slopeFriction = friction;
    }

}