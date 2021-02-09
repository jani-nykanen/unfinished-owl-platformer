import { State } from "./util.js";
import { Vector2 } from "./vector.js";
var GamePadListener = /** @class */ (function () {
    function GamePadListener() {
        var _this = this;
        this.stick = new Vector2(0, 0);
        this.buttons = new Array();
        this.pad = null;
        this.index = 0;
        window.addEventListener("gamepadconnected", function (ev) {
            console.log("Gamepad with index " +
                String(ev["gamepad"].index) +
                " connected.");
            var gp = navigator.getGamepads()[ev["gamepad"].index];
            _this.index = ev["gamepad"].index;
            _this.pad = gp;
            _this.updateGamepad(_this.pad);
        });
        this.anyPressed = false;
    }
    GamePadListener.prototype.pollGamepads = function () {
        // Why do I have this line here? Weird.
        if (navigator == null)
            return null;
        return navigator.getGamepads();
    };
    GamePadListener.prototype.updateButtons = function (pad) {
        if (pad == null) {
            for (var i = 0; i < this.buttons.length; ++i) {
                this.buttons[i] = State.Up;
            }
            return;
        }
        for (var i = 0; i < pad.buttons.length; ++i) {
            // Make sure the button exists in the array
            if (i >= this.buttons.length) {
                for (var j = 0; j < i - this.buttons.length; ++j) {
                    this.buttons.push(State.Up);
                }
            }
            if (pad.buttons[i].pressed) {
                if (this.buttons[i] == State.Up ||
                    this.buttons[i] == State.Released) {
                    this.anyPressed = true;
                    this.buttons[i] = State.Pressed;
                }
                else {
                    this.buttons[i] = State.Down;
                }
            }
            else {
                if (this.buttons[i] == State.Down ||
                    this.buttons[i] == State.Pressed) {
                    this.buttons[i] = State.Released;
                }
                else {
                    this.buttons[i] = State.Up;
                }
            }
        }
    };
    GamePadListener.prototype.updateStick = function (pad) {
        var DEADZONE = 0.25;
        var noLeftStick = true;
        if (pad != null) {
            this.stick.x = 0;
            this.stick.y = 0;
            if (Math.abs(pad.axes[0]) >= DEADZONE) {
                this.stick.x = pad.axes[0];
                noLeftStick = false;
            }
            if (Math.abs(pad.axes[1]) >= DEADZONE) {
                this.stick.y = pad.axes[1];
                noLeftStick = false;
            }
            // On Firefox dpad is considered
            // axes, not buttons
            if (pad.axes.length >= 8 && noLeftStick) {
                if (Math.abs(pad.axes[6]) >= DEADZONE)
                    this.stick.x = pad.axes[6];
                if (Math.abs(pad.axes[7]) >= DEADZONE)
                    this.stick.y = pad.axes[7];
            }
        }
    };
    GamePadListener.prototype.updateGamepad = function (pad) {
        this.updateStick(pad);
        this.updateButtons(pad);
    };
    GamePadListener.prototype.refreshGamepads = function () {
        // No gamepad available
        if (this.pad == null)
            return;
        var pads = this.pollGamepads();
        if (pads == null)
            return;
        this.pad = pads[this.index];
    };
    GamePadListener.prototype.update = function () {
        this.anyPressed = false;
        this.stick.x = 0.0;
        this.stick.y = 0.0;
        this.refreshGamepads();
        this.updateGamepad(this.pad);
    };
    GamePadListener.prototype.getButtonState = function (id) {
        if (id == null ||
            id < 0 ||
            id >= this.buttons.length)
            return State.Up;
        return this.buttons[id];
    };
    GamePadListener.prototype.isAnyButtonPressed = function () {
        return this.anyPressed;
    };
    GamePadListener.prototype.getStick = function () {
        return this.stick.clone();
    };
    return GamePadListener;
}());
export { GamePadListener };
