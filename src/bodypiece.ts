import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { CollisionObject } from "./gameobject.js";
import { Vector2 } from "./vector.js";


export class BodyPiece extends CollisionObject {

    constructor() {

        super(0, 0);

        this.exist = false;
        this.friction = new Vector2(0.01, 0.1);
        this.collisionBox = new Vector2(4, 6);

        this.bounceFactor = 0.75;
    }


    protected outsideCameraEvent() {

        this.exist = false;
    }


    public spawn(x : number, y : number, speed : Vector2) {

        const BASE_GRAVITY = 4.0;

        this.pos = new Vector2(x, y);
        this.speed = speed.clone();

        this.target = new Vector2(0, BASE_GRAVITY);

        this.exist = true;
        this.inCamera = true;
    }



    public draw(c : Canvas) {

        if (!this.exist || !this.inCamera) return;

        c.drawBitmapRegion(c.getBitmap("pieces"),
            0, 0, 16, 16,
            Math.round(this.pos.x)-8,
            Math.round(this.pos.y)-8);
    }
    

    protected slopeCollisionEvent(dir : number, k : number, ev : GameEvent) {

        const EPS = 0.1;

        if (Math.abs(this.speed.y) < EPS)
            this.exist = false;
    }

}
