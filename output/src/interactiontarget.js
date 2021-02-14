var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { WeakGameObject } from "./gameobject.js";
var InteractionTarget = /** @class */ (function (_super) {
    __extends(InteractionTarget, _super);
    function InteractionTarget(x, y) {
        return _super.call(this, x, y) || this;
    }
    InteractionTarget.prototype.playerCollision = function (pl, ev) {
        return false;
    };
    return InteractionTarget;
}(WeakGameObject));
export { InteractionTarget };
