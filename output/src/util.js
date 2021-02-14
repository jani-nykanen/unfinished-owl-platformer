/**
 * Project Island 2021
 *
 * (c) 2021 Jani Nykänen
 */
import { Vector2 } from "./vector.js";
export var State;
(function (State) {
    State[State["Up"] = 0] = "Up";
    State[State["Released"] = 2] = "Released";
    State[State["Down"] = 1] = "Down";
    State[State["Pressed"] = 3] = "Pressed";
    State[State["DownOrPressed"] = 1] = "DownOrPressed";
})(State || (State = {}));
var KeyValuePair = /** @class */ (function () {
    function KeyValuePair(key, value) {
        this.key = key;
        this.value = value;
    }
    return KeyValuePair;
}());
export { KeyValuePair };
export var negMod = function (m, n) {
    m |= 0;
    n |= 0;
    return ((m % n) + n) % n;
};
export var clamp = function (x, min, max) {
    return Math.max(min, Math.min(x, max));
};
export var updateSpeedAxis = function (speed, target, step) {
    if (speed < target) {
        return Math.min(target, speed + step);
    }
    return Math.max(target, speed - step);
};
export var boxOverlay = function (pos, center, hitbox, x, y, w, h) {
    var px = pos.x + center.x - hitbox.x / 2;
    var py = pos.y + center.y - hitbox.y / 2;
    return px + hitbox.x >= x && px < x + w &&
        py + hitbox.y >= y && py < y + h;
};
export var boxOverlayRect = function (rect, x, y, w, h) {
    return boxOverlay(new Vector2(rect.x + rect.w / 2, rect.y + rect.h / 2), new Vector2(), new Vector2(rect.w, rect.h), x, y, w, h);
};
export function nextObject(arr, type) {
    var o;
    o = null;
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var a = arr_1[_i];
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
export var computeFriction = function (target, k) {
    var EPS = 0.01;
    if (Math.abs(k) > EPS) {
        if (k > 0) {
            if (target > 0)
                k *= -0.5;
            target *= 1.0 - 0.5 * k;
        }
        else {
            if (target < 0)
                k *= -0.5;
            target *= 1.0 + 0.5 * k;
        }
    }
    return target;
};
