/**
 * Project Island 2021
 * 
 * (c) 2021 Jani Nykänen
 */

import { ExistingObject } from "./gameobject.js";
import { Vector2, Rect } from "./vector.js";


export enum State {

    Up = 0, 
    Released = 2,
    Down = 1, 
    Pressed = 3, 

    DownOrPressed = 1,
}


export class KeyValuePair<T> {

    public readonly key : string;
    public value : T;

    
    constructor(key : string, value : T) {

        this.key = key;
        this.value = value;
    }
}


export const negMod = (m : number, n : number) : number => {

    m |= 0;
    n |= 0;

    return ((m % n) + n) % n;
}


export const clamp = (x : number, min : number, max : number) : number => {

    return Math.max(min, Math.min(x, max));
}


export const updateSpeedAxis = (speed : number, target : number, step : number) : number => {
		
    if (speed < target) {
        
        return Math.min(target, speed+step);
    }
    return Math.max(target, speed-step);
}


export const boxOverlay = (pos : Vector2, center : Vector2, hitbox : Vector2, 
    x : number, y : number, w : number, h : number) : boolean => {

    let px = pos.x + center.x - hitbox.x/2;
    let py = pos.y + center.y - hitbox.y/2;

    return px + hitbox.x >= x && px < x+w &&
           py + hitbox.y >= y && py < y+h;
}


export const boxOverlayRect = (rect : Rect, 
    x : number, y : number, w : number, h : number) : boolean => {

    return boxOverlay(
        new Vector2(rect.x + rect.w/2, rect.y + rect.h/2), 
        new Vector2(), 
        new Vector2(rect.w, rect.h), 
        x, y, w, h);
}


export function nextObject<T extends ExistingObject> (arr : Array<T>, type : Function) {

    let o : T;

    o = null;
    for (let a of arr) {

        if (!a.doesExist()) {

            o = a;
            break;
        }
    }

    if (o == null) {

        o = new type.prototype.constructor();
        arr.push(o);
    }

    return o;
}
