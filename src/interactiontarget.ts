import { GameEvent } from "./core.js";
import { WeakGameObject } from "./gameobject.js";
import { Player } from "./player.js";


export class InteractionTarget extends WeakGameObject {


    constructor(x : number, y : number) {

        super(x, y);
    }


    public playerCollision(pl : Player, ev : GameEvent) : boolean {

        return false;
    }
}
