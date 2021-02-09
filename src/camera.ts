import { Canvas } from "./canvas.js";
import { GameEvent } from "./core.js";
import { GameObject } from "./gameobject.js";
import { updateSpeedAxis } from "./util.js";
import { Rect, Vector2 } from "./vector.js";


export class Camera {


    private pos : Vector2;
    private viewport : Rect;
    private centerOff : Vector2;
    private centerOffTarget : Vector2;


    constructor(x : number, y : number) {

        this.pos = new Vector2(x, y);
        this.viewport = new Rect();

        this.centerOff = new Vector2();
        this.centerOffTarget = this.centerOff.clone();
    }


    public computeViewport(c : Canvas) {

        this.viewport.w = c.width;
        this.viewport.h = c.height;

        this.viewport.x = this.pos.x + this.centerOff.x - this.viewport.w/2;
        this.viewport.y = this.pos.y + this.centerOff.y - this.viewport.h/2;
    }


    public use(c : Canvas) {

        this.computeViewport(c);
        c.moveTo(-Math.round(this.viewport.x), -Math.round(this.viewport.y));
    }
    

    public followObject(o : GameObject, ev : GameEvent) {

        const EPS = 0.1;
        const FORWARD = 48;
        const MOVE_SPEED_X = 1.0;
        const VERTICAL_DEADZONE = 32;

        this.pos.x = o.getPos().x;
        let d = this.pos.y - o.getPos().y;
        if (Math.abs(d) >= VERTICAL_DEADZONE) {

            this.pos.y = o.getPos().y + VERTICAL_DEADZONE * Math.sign(d);
        }

        let target = o.getTarget().x;
        let dir = 0;
        if (Math.abs(target) > EPS) {

            dir = Math.sign(target);
        }

        this.centerOffTarget.x = dir * FORWARD;

        this.centerOff.x = updateSpeedAxis(this.centerOff.x, 
            this.centerOffTarget.x, MOVE_SPEED_X * ev.step);
    }


    public restrictCamera(x : number, y : number, w : number, h : number) {

        let oldViewport = this.viewport.clone();

        // Left
        if (this.viewport.x < x) {

            if (this.centerOff.x < 0) {

                this.centerOff.x += (x - this.viewport.x);
                if (this.centerOff.x > 0)
                    this.centerOff.x = 0;
            }
            
            if (this.centerOff.x >= 0) {

                this.viewport.x = x;
                this.pos.x += this.viewport.x - oldViewport.x;
            }
        }
        // Right
        if (this.viewport.x + this.viewport.w > x + w) {

            if (this.centerOff.x > 0) {

                this.centerOff.x += (x + w - this.viewport.x - this.viewport.w);
                if (this.centerOff.x < 0)
                    this.centerOff.x = 0;
            }
            
            if (this.centerOff.x <= 0) {

                this.viewport.x = (x+w) - this.viewport.w;
                this.pos.x += this.viewport.x - oldViewport.x;
            }
        }

        // Top
        if (this.viewport.y < y) {
            
            this.viewport.y = y;
        }
        // Bottom
        if (this.viewport.y + this.viewport.h > (y+h)) {
            
            this.viewport.y = (y+h) - this.viewport.h;
        }
        this.pos.y += this.viewport.y - oldViewport.y;
    }


    public getViewport = () : Rect => this.viewport.clone();
}
