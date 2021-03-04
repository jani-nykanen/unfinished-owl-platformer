import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { InteractionTarget } from "./interactiontarget.js";
import { Particle } from "./particle.js";
import { Player } from "./player.js";
import { Sprite } from "./sprite.js";
import { nextObject } from "./util.js";
import { Vector2 } from "./vector.js";


const COLLECTIBLE_DEATH_TIME = 32;


export class Collectible extends InteractionTarget {

    private waveTimer : number;
    private deathTimer : number;
    private id : number;
    
    private particles : Array<Particle>;


    constructor(x : number, y  : number, id = 0) {

        super(x, y);

        this.spr = new Sprite(24, 24);
        this.spr.setFrame(0, id)
        this.hitbox = new Vector2(8, 20);
        this.waveTimer = Math.random() * (Math.PI * 2);

        this.deathTimer = 0;
        this.particles = new Array<Particle>();

        this.id = id;
    }


    protected die(ev : GameEvent) : boolean {

        for (let p of this.particles) {

            p.update(ev);
        }

        return (this.deathTimer -= ev.step) <= 0;
    }


    protected updateLogic(ev : GameEvent) {

        const ANIM_SPEED = [6, 6, 6, 8];
        const LAST_FRAME = [7, 7, 7, 4];
        const WAVE_SPEED = 0.05;

        this.spr.animate(this.spr.getRow(), 0, 
            LAST_FRAME[this.id], ANIM_SPEED[this.id], ev.step);

        this.waveTimer = (this.waveTimer + WAVE_SPEED*ev.step) % (Math.PI*2);
    }


    private drawFlyingText(c : Canvas) {

        let y = Math.min(COLLECTIBLE_DEATH_TIME/2, 
            COLLECTIBLE_DEATH_TIME - this.deathTimer);

        y = Math.round(this.pos.y - y * 2);

        c.drawText(c.getBitmap("font"), "1 UP!", 
            Math.round(this.pos.x), y, 
            0, 0, true);
    }


    public draw(c : Canvas) {

        const AMPLITUDE = 3;

        if (!this.exist || !this.inCamera) return;

        if (this.dying) {

            for (let p of this.particles) {

                p.draw(c);
            }

            if (this.id == 1)
                this.drawFlyingText(c);

            return;
        }

        let yoff = Math.round(Math.sin(this.waveTimer) * AMPLITUDE);

        c.drawSprite(this.spr, c.getBitmap("star"),
            Math.round(this.pos.x) - 12,
            Math.round(this.pos.y) - 12 + yoff);
    }


    private spawnParticles(count : number, speedAmount : number, angleOffset = 0) {

        const BASE_JUMP = -0.5;
        const BASE_GRAVITY = 0.2;

        let angle : number;
        let speed : Vector2;

        for (let i = 0; i < count; ++ i) {

            angle = Math.PI * 2 / count * i + angleOffset;

            speed = new Vector2(
                Math.cos(angle) * speedAmount,
                Math.sin(angle) * speedAmount + BASE_JUMP * speedAmount);

            nextObject(this.particles, Particle)
                .spawn(this.pos.x, this.pos.y, speed, 
                    COLLECTIBLE_DEATH_TIME-1, COLLECTIBLE_DEATH_TIME / 4,
                    BASE_GRAVITY, this.id);
        }
    }


    public playerCollision(pl : Player, ev : GameEvent) : boolean {

        if (!this.exist || this.dying || !this.inCamera || pl.isDying())
            return false;

        if (pl.overlayObject(this)) {

            this.spawnParticles(5, 3, -Math.PI/10);

            this.dying = true;
            this.deathTimer = COLLECTIBLE_DEATH_TIME;

            pl.addCollectable(this.id, this.pos.x, this.pos.y);

            return true;
        }

        return false;
    }
}
