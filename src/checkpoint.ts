import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { InteractionTarget } from "./interactiontarget.js";
import { Player } from "./player.js";
import { Sprite } from "./sprite.js";
import { Vector2 } from "./vector.js";


export class Checkpoint extends InteractionTarget {


    private waveTimer : number;
    private active : boolean;


    constructor(x : number, y  : number) {

        super(x, y);

        this.spr = new Sprite(24, 24);
        this.hitbox = new Vector2(8, 20);
        this.waveTimer = Math.random() * (Math.PI * 2);

        this.active = false;
    }


    protected updateLogic(ev : GameEvent) {

        const ANIM_SPEED = 6;
        const WAVE_SPEED = 0.05;

        if (!this.active) return;

        this.spr.animate(0, 1, 5, ANIM_SPEED, ev.step);

        this.waveTimer = (this.waveTimer + WAVE_SPEED*ev.step) % (Math.PI*2);
    }


    public draw(c : Canvas) {

        const AMPLITUDE = 3;

        if (!this.exist || !this.inCamera) return;

        let yoff = Math.round(Math.sin(this.waveTimer) * AMPLITUDE);

        c.drawSprite(this.spr, c.getBitmap("checkpoint"),
            Math.round(this.pos.x) - 12,
            Math.round(this.pos.y) - 12 + yoff);
    }


    public playerCollision(pl : Player, ev : GameEvent) : boolean {

        if (!this.exist || this.dying || !this.inCamera)
            return false;

        if (pl.overlayObject(this)) {

            this.active = true;
            pl.setCheckPoint(this.pos);

            return true;
        }

        return false;
    }


    public deactivate() {

        this.active = false;
        this.spr.setFrame(0, 0);
        this.waveTimer = 0;
    }
}
