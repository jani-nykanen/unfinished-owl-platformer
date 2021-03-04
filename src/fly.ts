import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { GameObject } from "./gameobject.js";
import { Sprite } from "./sprite.js";
import { Vector2 } from "./vector.js";


export class FollowerFly extends GameObject {


    private followedObject : GameObject;
    private distanceToObject : number;
    private triggerDistance : number;

    private waveTimer : number;


    constructor( followedObject : GameObject, triggerDistance : number) {

        super(0, 0);

        this.followedObject = followedObject;
        this.exist = false;

        this.friction = new Vector2(0.1, 0.1);

        this.computeDistanceToTarget();
        this.triggerDistance = triggerDistance;

        this.spr = new Sprite(16, 16);

        this.inCamera = true;
        this.waveTimer = 0;
    }


    public spawn(x : number, y : number) {

        this.pos = new Vector2(x, y);
        this.exist = true;

        this.spr.setFrame(0, 1);

        this.stopMovement();
    }


    public kill(ev : GameEvent) {

        this.dying = true;
    }


    protected die(ev : GameEvent) : boolean {

        const DEATH_SPEED = 5;

        this.spr.animate(0, 0, 4, DEATH_SPEED, ev.step);
        return this.spr.getColumn() >= 4;
    }


    protected computeDistanceToTarget() {

        this.distanceToObject = Vector2.distance(this.pos, this.followedObject.getPos());
    }


    protected updateLogic(ev : GameEvent) {

        const SPEED_MOD = 16.0;
        const ANIM_SPEED = 3;
        const WAVE_SPEED = 0.1;

        this.computeDistanceToTarget();

        let speed : number;
        if (this.distanceToObject > this.triggerDistance) {

            speed = (this.distanceToObject - this.triggerDistance) / SPEED_MOD;

            this.target = Vector2.scalarMultiply(
                Vector2.direction(this.pos, this.followedObject.getPos()), 
                speed);
        }
        else {

            this.target.zeros();
        }

        this.spr.animate(1, 0, 3, ANIM_SPEED, ev.step);

        this.waveTimer = (this.waveTimer + WAVE_SPEED * ev.step) % (Math.PI*2);
    }


    public draw(c : Canvas) {

        const AMPLITUDE = 2;

        if (!this.exist || !this.inCamera) return;

        let jump = Math.round(Math.sin(this.waveTimer) * AMPLITUDE);

        c.drawSprite(this.spr, c.getBitmap("fly"),
            Math.round(this.pos.x) - 8, 
            Math.round(this.pos.y) - 8 + jump);
    }


    public setPos(x : number, y : number) {

        this.pos = new Vector2(x, y);
    }
}
