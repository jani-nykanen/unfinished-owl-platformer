import { Camera } from "./camera.js";
import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { Sprite } from "./sprite.js";
import { boxOverlay, updateSpeedAxis } from "./util.js";
import { Vector2 } from "./vector.js";


export abstract class ExistingObject {

    protected exist : boolean;


    constructor() {

        this.exist = false;
    }
    

    public doesExist = () : boolean => this.exist;
}


export abstract class GameObject extends ExistingObject {
    

    protected pos : Vector2;
    protected oldPos : Vector2;
    protected speed : Vector2;
    protected target : Vector2;
    protected friction : Vector2;
    protected center : Vector2;

    protected hitbox : Vector2;

    protected dying : boolean;
    protected inCamera : boolean;

    protected spr : Sprite;


    constructor(x : number, y : number) {

        super();

        this.pos = new Vector2(x, y);
        this.oldPos = this.pos.clone();
        this.speed = new Vector2();
        this.target = this.speed.clone();
        this.friction = new Vector2(1, 1);
        this.center = new Vector2();

        this.hitbox = new Vector2();

        this.spr = new Sprite(0, 0);

        this.dying = false;
        this.inCamera = false;

        this.exist = true;
    }


    protected die (ev : GameEvent) : boolean {

        return true;
    }


    protected updateLogic(ev : GameEvent) {}
    protected postUpdate(ev : GameEvent) {}
    protected outsideCameraEvent() {}


    private updateMovement(ev : GameEvent) {

        this.speed.x = updateSpeedAxis(this.speed.x,
            this.target.x, this.friction.x*ev.step);
        this.speed.y = updateSpeedAxis(this.speed.y,
            this.target.y, this.friction.y*ev.step);

        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;
    }


    public update(ev : GameEvent) {

        if (!this.exist || !this.inCamera) return;

        if (this.dying) {

            if (this.die(ev)) {

                this.exist = false;
                this.dying = false;
            }
            return;
        }

        this.oldPos = this.pos.clone();

        this.updateLogic(ev);
        this.updateMovement(ev);
        this.postUpdate(ev);
    }


    public stopMovement() {

        this.speed.zeros();
        this.target.zeros();
    }


    public cameraCheck(cam : Camera) {

        let view = cam.getViewport();

        let oldState = this.inCamera;
        this.inCamera = boxOverlay(this.pos, this.center, this.hitbox,
            view.x, view.y, view.w, view.h);

        if (oldState && !this.inCamera) {

            this.outsideCameraEvent();
        }
    }


    public overlayObject(o : GameObject) : boolean {

        return boxOverlay(this.pos, this.center, this.hitbox,
            o.pos.x + o.center.x - o.hitbox.x/2,
            o.pos.y + o.center.y - o.hitbox.y/2,
            o.hitbox.x, o.hitbox.y);
    }


    public draw(c : Canvas) {}
    public postDraw(c : Canvas) {}

    public getPos = () => this.pos.clone();
    public getSpeed = () => this.speed.clone();
    public getTarget = () => this.target.clone();

    public isInCamera = () => this.inCamera;
    public isDying = () => this.dying;

    public doesExist = () => this.exist;
}


export abstract class CollisionObject extends GameObject {


    protected collisionBox : Vector2;
    protected bounceFactor : number;
    protected disableCollisions : boolean;


    constructor(x : number, y : number) {

        super(x, y);

        this.collisionBox = new Vector2();
        this.bounceFactor = 0;

        this.disableCollisions = false;
    }


    protected wallCollisionEvent(dir : number, ev : GameEvent) {}
    protected slopeCollisionEvent(dir : number, friction : number, ev : GameEvent) {}


    public wallCollision(
        x : number, y : number, h : number, 
        dir : number, ev : GameEvent, force = false) {

        const EPS = 0.001;
        const V_MARGIN = 1;
        const NEAR_MARGIN = 2;
        const FAR_MARGIN = 8;
        
        if (!this.inCamera ||
            (!force && this.disableCollisions) ||
            !this.exist || this.dying || 
            this.speed.x * dir < EPS) 
            return false;

        let top = this.pos.y + this.center.y - this.collisionBox.y/2;
        let bottom = top + this.collisionBox.y;

        if (bottom <= y + V_MARGIN || top >= y + h - V_MARGIN)
            return false;

        let xoff = this.center.x + this.collisionBox.x/2 * dir;
        let nearOld = this.oldPos.x + xoff
        let nearNew = this.pos.x + xoff;

        if ((dir > 0 && nearNew >= x - NEAR_MARGIN*ev.step &&
             nearOld <= x + (FAR_MARGIN + this.speed.x)*ev.step) || 
             (dir < 0 && nearNew <= x + NEAR_MARGIN*ev.step &&
             nearOld >= x - (FAR_MARGIN - this.speed.x)*ev.step)) {

            this.pos.x = x - xoff;
            this.speed.x *= -this.bounceFactor;

            this.wallCollisionEvent(dir, ev);

            return true;
        }

        return false;
    }    


    public slopeCollision(x1 : number, y1: number, x2 : number, y2 : number, 
        dir : number, ev : GameEvent, force = false) : boolean {

        const EPS = 0.001;
        const NEAR_MARGIN = 2;
        const FAR_MARGIN = 8;

        if (!this.inCamera ||
            (!force && this.disableCollisions) ||
            !this.exist || this.dying ||
            this.speed.y * dir < EPS ||
            Math.abs(x1 - x2) < EPS)
            return false;

        if (this.pos.x < x1 || this.pos.x >= x2)
            return false;

        let k = (y2 - y1) / (x2 - x1);
        let y0 = y1 + k * (this.pos.x - x1);

        let py = this.pos.y + this.center.y + dir * this.collisionBox.y/2;

        if ((dir > 0 && py > y0 - NEAR_MARGIN * ev.step && 
            py <= y0 + (this.speed.y + FAR_MARGIN) * ev.step) || 
            (dir < 0 && py < y0 + NEAR_MARGIN * ev.step && 
            py >= y0 + (this.speed.y - FAR_MARGIN) * ev.step) ) {

            this.speed.y = 0;
            this.pos.y = y0 - this.center.y - dir*this.collisionBox.y/2;

            this.slopeCollisionEvent(dir, k, ev);
            return true;
        }
    
        return false;
    }


    public constantSlopeCollision(x : number, y : number, w : number, dir : number,
        leftMargin : boolean, rightMargin : boolean, ev : GameEvent) : boolean {

        if (leftMargin) {
            
            x -= this.collisionBox.x/2;
            w += this.collisionBox.x/2;
        }

        if (rightMargin) {
            
            w += this.collisionBox.x/2;
        }

        return this.slopeCollision(x, y, x+w, y, dir, ev);
    }


    public hurtCollision(x : number, y : number, w : number, h : number, 
        dmg : number, knockback : Vector2, ev : GameEvent) : boolean {

        return false;
    }


    public getHitbox = () : Vector2 => this.hitbox.clone();
    public collisionsDisabled = () : boolean => this.disableCollisions;
}
