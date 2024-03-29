import { AssetManager } from "./assets.js";
import { Canvas } from "./canvas.js";
import { InputManager } from "./input.js";
import { Tilemap } from "./tilemap.js";
import { State } from "./util.js";
import { Vector2 } from "./vector.js";


export class GameEvent {


    public readonly step : number;
    private readonly input : InputManager;
    private readonly assets : AssetManager;
    private readonly core : Core;
    private readonly canvas : Canvas;


    constructor(step : number, core : Core, canvas : Canvas,
        input : InputManager, assets : AssetManager) {

        this.core = core;
        this.step = step;
        this.canvas = canvas;
        this.input = input;
        this.assets = assets;
    }


    public getStick() : Vector2 {

        return this.input.getStick();
    }


    public getAction(name : string) : State {

        return this.input.getAction(name);
    }


    public getTilemap(name : string) : Tilemap {

        return this.assets.getTilemap(name);
    }


    public changeScene(newScene : Function) {

        this.core.changeScene(newScene);
    }


    public shake(shakeTime : number, magnitude : number) {

        this.canvas.shake(shakeTime, magnitude);
    }


    public isShaking = () : boolean => this.canvas.isShaking();
}


export interface Scene {

    refresh(ev : GameEvent) : void;
    redraw(c : Canvas) : void;

    // TODO: Replace any with... something 
    dispose() : any;
}


export class Core {

    private canvas : Canvas;
    private assets : AssetManager;
    private input : InputManager;
    private ev : GameEvent;

    private activeScene : Scene;
    private activeSceneType : Function;

    private timeSum : number;
    private oldTime : number;

    private initialized : boolean;


    constructor(canvasWidth : number, canvasHeight : number, frameSkip : number) {

        this.assets = new AssetManager();
        this.canvas = new Canvas(canvasWidth, canvasHeight, this.assets);

        this.input = new InputManager();
        this.input.addAction("left", "ArrowLeft", 14)
            .addAction("up", "ArrowUp", 12)
            .addAction("right", "ArrowRight", 15)
            .addAction("down", "ArrowDown", 13),

        this.ev = new GameEvent(frameSkip+1, this, this.canvas, 
            this.input, this.assets);

        this.timeSum = 0.0;
        this.oldTime = 0.0;

        this.initialized = false;

        this.activeScene = null;
        this.activeSceneType = null;
    }


    private drawLoadingScreen(c : Canvas) {

        let barWidth = c.width / 4;
        let barHeight = barWidth / 8;

        c.clear(0, 0, 0);
    
        let t = this.assets.dataLoadedUnit();
        let x = c.width/2 - barWidth/2;
        let y = c.height/2 - barHeight/2;

        x |= 0;
        y |= 0;
    
        // Outlines
        c.setFillColor(255);
        c.fillRect(x-2, y-2, barWidth+4, barHeight+4);
        c.setFillColor(0);
        c.fillRect(x-1, y-1, barWidth+2, barHeight+2);
    
        // Bar
        let w = (barWidth*t) | 0;
        c.setFillColor(255);
        c.fillRect(x, y, w, barHeight);
    }


    private loop(ts : number) {

        const MAX_REFRESH_COUNT = 5;
        const FRAME_WAIT = 16.66667 * this.ev.step;

        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;

        let refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        while ((refreshCount --) > 0) {

            if (!this.initialized && this.assets.hasLoaded()) {
                
                if (this.activeSceneType != null)
                    this.activeScene = new this.activeSceneType.prototype.constructor(null, this.ev);
                    
                this.initialized = true;
            }

            this.input.preUpdate();

            if (this.initialized && this.activeScene != null) {

                this.activeScene.refresh(this.ev);
            }
            this.canvas.update(this.ev);

            this.input.postUpdate();

            this.timeSum -= FRAME_WAIT;
        }

        if (this.initialized) {

            if (this.activeScene != null)
                this.activeScene.redraw(this.canvas);
        }
        else {

            this.drawLoadingScreen(this.canvas);
        }

        window.requestAnimationFrame(ts => this.loop(ts));
    }


    public addInputAction(name : string, key : string, 
        button1 : number, button2 = -1) : Core {

        this.input.addAction(name, key, button1, button2);

        return this;
    }


    public loadAssets(indexFilePath : string) : Core {

        this.assets.parseAssetIndexFile(indexFilePath);

        return this;
    }


    public run(initialScene : Function) {

        this.activeSceneType = initialScene;

        this.loop(0);
    }


    public changeScene(newScene : Function) {

        let param = this.activeScene.dispose();
        this.activeScene = new newScene.prototype.constructor(param, this.ev);
    }
    
}
