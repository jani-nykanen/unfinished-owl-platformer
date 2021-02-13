import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { ExistingObject } from "./gameobject.js";
import { Vector2 } from "./vector.js";


export class Particle extends ExistingObject {


    private pos : Vector2;
    private speed : Vector2;
    private gravity : number;

    private timer : number;
    
    private id : number;


    constructor() {

        super();

        this.exist = false;
    }


    public spawn(x : number, y : number, speed : Vector2, time : number, gravity = 0, id = 0) {

        this.pos = new Vector2(x, y);
        this.speed = speed.clone();
        this.gravity = gravity;
        this.timer = time;
        this.id = id;

        this.exist = true;
    }


    public update(ev : GameEvent) {

        if (!this.exist) return;

        this.speed.y += this.gravity * ev.step;

        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;

        if ((this.timer -= ev.step) <= 0) {

            this.exist = false;
        }
    }


    public draw(c : Canvas) {

        if (!this.exist) return;

        c.drawBitmapRegion(c.getBitmap("particles"), 
            0, this.id*16, 16, 16,
            Math.round(this.pos.x) - 8,
            Math.round(this.pos.y) - 8);
    }

}
