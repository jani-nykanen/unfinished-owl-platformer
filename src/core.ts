

export class GameEvent {


    public readonly step : number;
    private readonly core : Core;


    constructor(step : number, core : Core) {

        this.core = core;
        this.step = step;
    }
}


export class Core {

    private ev : GameEvent;

    private timeSum : number;
    private oldTime : number;

    private initialized : boolean;


    constructor(canvasWidth : number, canvasHeight : number, frameSkip : number) {

        this.ev = new GameEvent(frameSkip+1, this);

        this.timeSum = 0.0;
        this.oldTime = 0.0;

        this.initialized = false;
    }

    private loop(ts : number) {

        const MAX_REFRESH_COUNT = 5;
        const FRAME_WAIT = 16.66667 * this.ev.step;

        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;

        let refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        while ((refreshCount --) > 0) {

            this.timeSum -= FRAME_WAIT;
        }

        window.requestAnimationFrame(ts => this.loop(ts));
    }


    public run() {

        this.loop(0);
    }

}
