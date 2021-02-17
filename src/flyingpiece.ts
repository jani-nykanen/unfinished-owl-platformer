import { Canvas, Flip } from "./canvas.js";
import { GameEvent } from "./core.js";
import { CollisionObject } from "./gameobject.js";
import { Sprite } from "./sprite.js";
import { Vector2 } from "./vector.js";


export class FlyingPiece extends CollisionObject {


    private animate : boolean;


    constructor() {

        super(0, 0);

        this.exist = false;
        this.friction = new Vector2(0.01, 0.1);
        this.collisionBox = new Vector2(4, 8);

        this.spr = new Sprite(16, 16);
        this.spr.setFrame(0, 0);

        this.bounceFactor = 0.90;

        this.animate = false;
    }


    protected outsideCameraEvent() {

        this.exist = false;
    }


    public spawn(x : number, y : number, speed : Vector2, row = 0, frame = -1) {

        const BASE_GRAVITY = 4.0;

        this.pos = new Vector2(x, y);
        this.speed = speed.clone();

        this.target = new Vector2(0, BASE_GRAVITY);

        this.exist = true;
        this.inCamera = true;

        this.animate = frame < 0;
        this.spr.setFrame(Math.max(0, frame), row);
    }


    public updateLogic(ev : GameEvent) {

        let speed = 12 - 6 * Math.abs(this.speed.x);

        if (this.animate)
            this.spr.animate(this.spr.getRow(), 0, 3, speed, ev.step);
    }



    public draw(c : Canvas) {

        if (!this.exist || !this.inCamera) return;

        let flip = this.speed.x > 0 ? Flip.Horizontal : Flip.None;

        c.drawSprite(this.spr, c.getBitmap("pieces"),
            Math.round(this.pos.x)-8,
            Math.round(this.pos.y)-8,
            flip);
    }
    

    protected slopeCollisionEvent(dir : number, k : number, ev : GameEvent) {

        const EPS = 0.1;

        if (Math.abs(this.speed.y) < EPS &&
            Math.abs(this.speed.x) < EPS)
            this.exist = false;
    }

}
