import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { InteractionTarget } from "./interactiontarget.js";
import { Player } from "./player.js";
import { Sprite } from "./sprite.js";
import { Vector2 } from "./vector.js";


const TEXT_TIME = 60;


export class Checkpoint extends InteractionTarget {


    private waveTimer : number;
    private active : boolean;
    private actualSprite : Sprite;
    private textTimer : number;
    private textPos : number;


    constructor(x : number, y  : number, makeActive = false) {

        super(x, y);

        this.textTimer = 0;

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


    protected outsideCameraEvent() {

        this.textTimer = 0;
    }


    protected updateLogic(ev : GameEvent) {

        const ANIM_SPEED = 6;
        const WAVE_SPEED = 0.05;
        const STOP_TEXT_MOVEMENT = 40;
        const TEXT_SPEED = 2;

        if (!this.active) return;

        this.actualSprite.animate(0, 1, 5, ANIM_SPEED, ev.step);

        this.waveTimer = (this.waveTimer + WAVE_SPEED*ev.step) % (Math.PI*2);

        if (this.textTimer > 0) {

            if (this.textTimer > STOP_TEXT_MOVEMENT) {

                this.textPos -= TEXT_SPEED * ev.step;
            }
            this.textTimer -= ev.step;
        }
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


    public postDraw(c : Canvas) {

        if (!this.exist || this.textTimer <= 0) return;

        c.drawText(c.getBitmap("font"), "CHECKPOINT",
                this.pos.x, this.textPos, 0, 0, true);
    }


    public playerCollision(pl : Player, ev : GameEvent) : boolean {

        if (!this.exist || this.dying || !this.inCamera || pl.isDying())
            return false;

        if (!this.active &&
            pl.overlayObject(this)) {

            this.active = true;
            pl.setCheckpoint(this.pos);

            this.textTimer = TEXT_TIME;
            this.textPos = this.pos.y - 8;

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
