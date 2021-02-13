import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { ExistingObject } from "./gameobject.js";
import { Sprite } from "./sprite.js";
import { Vector2 } from "./vector.js";


export class Particle extends ExistingObject {


    private pos : Vector2;
    private speed : Vector2;
    private gravity : number;

    private timer : number;

    private animSpeed : number;
    private spr : Sprite;

    private id : number;


    constructor() {

        super();

        this.exist = false;
    }


    public spawn(x : number, y : number, speed : Vector2, 
        time : number, animSpeed : number, gravity = 0, id = 0) {

        this.pos = new Vector2(x, y);
        this.speed = speed.clone();
        this.gravity = gravity;
        this.timer = time;

        this.animSpeed = animSpeed;
        this.spr = new Sprite(16, 16);
        this.spr.setFrame(0, id);

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

        this.spr.animate(this.id, 0, 3, this.animSpeed, ev.step);
    }


    public draw(c : Canvas) {

        if (!this.exist) return;

        c.drawSprite(this.spr, c.getBitmap("particles"), 
            Math.round(this.pos.x) - 8,
            Math.round(this.pos.y) - 8);
    }

}
