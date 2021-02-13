import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { WeakGameObject } from "./gameobject.js";
import { Player } from "./player.js";
import { Sprite } from "./sprite.js";
import { Vector2 } from "./vector.js";


export class Star extends WeakGameObject {


    private waveTimer : number;


    constructor(x : number, y  : number) {

        super(x, y);

        this.spr = new Sprite(24, 24);
        this.hitbox = new Vector2(8, 20);
        this.waveTimer = Math.random() * (Math.PI * 2);
    }


    protected updateLogic(ev : GameEvent) {

        const ANIM_SPEED = 6;
        const WAVE_SPEED = 0.05

        this.spr.animate(0, 0, 7, ANIM_SPEED, ev.step);

        this.waveTimer = (this.waveTimer + WAVE_SPEED*ev.step) % (Math.PI*2);
    }


    public draw(c : Canvas) {

        const AMPLITUDE = 3;

        if (!this.exist || !this.inCamera) return;

        let yoff = Math.round(Math.sin(this.waveTimer) * AMPLITUDE);

        c.drawSprite(this.spr, c.getBitmap("star"),
            Math.round(this.pos.x) - 12,
            Math.round(this.pos.y) - 12 + yoff);
    }


    public playerCollision(pl : Player) : boolean {

        if (!this.exist || this.dying || !this.inCamera)
            return false;

        if (pl.overlayObject(this)) {

            this.dying = true;
            return true;
        }

        return false;
    }
}
