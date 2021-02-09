import { Canvas } from "./canvas.js";
import { Rect, Vector2 } from "./vector.js";


export class Camera {


    private pos : Vector2;
    private viewport : Rect;


    constructor(x : number, y : number) {

        this.pos = new Vector2(x, y);
        this.viewport = new Rect();
    }


    public use(c : Canvas) {

        this.viewport.w = c.width;
        this.viewport.h = c.height;

        this.viewport.x = this.pos.x - this.viewport.w/2;
        this.viewport.y = this.pos.y - this.viewport.h/2;

        c.moveTo(-this.viewport.x, -this.viewport.y);
    }
    

    public getViewport = () : Rect => this.viewport.clone();
}
