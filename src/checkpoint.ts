import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { InteractionTarget } from "./interactiontarget.js";
import { Player } from "./player.js";
import { Sprite } from "./sprite.js";
import { Vector2 } from "./vector.js";


export class Checkpoint extends InteractionTarget {


    private waveTimer : number;
    private active : boolean;
    private actualSprite : Sprite;


    constructor(x : number, y  : number, makeActive = false) {

        super(x, y);

        // For checking if in camera 
        // (need more height because of the
        // wave animation)
        this.spr = new Sprite(16, 24);

        // For animation
        this.actualSprite = new Sprite(16, 16);
        this.hitbox = new Vector2(12, 16);
        this.waveTimer = Math.PI/2;

        this.active = makeActive;
        if (makeActive)
            this.spr.setFrame(1, 0);
    }


    protected updateLogic(ev : GameEvent) {

        const ANIM_SPEED = 6;
        const WAVE_SPEED = 0.05;

        if (!this.active) return;

        this.actualSprite.animate(0, 1, 5, ANIM_SPEED, ev.step);

        this.waveTimer = (this.waveTimer + WAVE_SPEED*ev.step) % (Math.PI*2);
    }


    public draw(c : Canvas) {

        const AMPLITUDE = 3;

        if (!this.exist || !this.inCamera) return;

        let yoff = 1; 
        if (this.active)
            yoff = -4 + Math.round(Math.sin(this.waveTimer) * AMPLITUDE);

        c.drawSprite(this.actualSprite, 
            c.getBitmap("checkpoint"),
            Math.round(this.pos.x) - 8,
            Math.round(this.pos.y) - 8 + yoff);
    }


    public playerCollision(pl : Player, ev : GameEvent) : boolean {

        if (!this.exist || this.dying || !this.inCamera || pl.isDying())
            return false;

        if (pl.overlayObject(this)) {

            this.active = true;
            pl.setCheckpoint(this.pos);

            return true;
        }

        if (this.active && pl.getCheckpointRef() != this.pos) {

            this.deactivate();
        }

        return false;
    }


    public deactivate() {

        this.active = false;
        this.actualSprite.setFrame(0, 0);
        this.waveTimer = Math.PI/2;
    }

}
