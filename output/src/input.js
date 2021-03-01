import { GamePadListener } from "./gamepad.js";
import { KeyValuePair } from "./util.js";
import { Vector2 } from "./vector.js";
import { State } from "./util.js";
var INPUT_SPECIAL_EPS = 0.25;
var InputAction = /** @class */ (function () {
    function InputAction(name, key, button1, button2) {
        if (button1 === void 0) { button1 = -1; }
        if (button2 === void 0) { button2 = -2; }
        this.name = name;
        this.key = key;
        this.button1 = button1;
        this.button2 = button2;
        this.state = State.Up;
    }
    return InputAction;
}());
export { InputAction };
var InputManager = /** @class */ (function () {
    function InputManager() {
        var _this = this;
        this.keyStates = new Array();
        this.prevent = new Array();
        this.actions = new Array();
        this.gamepad = new GamePadListener();
        this.stick = new Vector2(0, 0);
        this.oldStick = new Vector2(0, 0);
        this.stickDelta = new Vector2(0, 0);
        window.addEventListener("keydown", function (e) {
            if (_this.keyPressed(e.code))
                e.preventDefault();
        });
        window.addEventListener("keyup", function (e) {
            if (_this.keyReleased(e.code))
                e.preventDefault();
        });
        window.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        });
        // To get the focus when embedded to an iframe
        window.addEventListener("mousemove", function (e) {
            window.focus();
        });
        window.addEventListener("mousedown", function (e) {
            window.focus();
        });
        this.anyKeyPressed = false;
    }
    InputManager.prototype.setKeyState = function (key, s) {
        for (var _i = 0, _a = this.keyStates; _i < _a.length; _i++) {
            var e = _a[_i];
            if (e.key == key) {
                e.value = s;
                return;
            }
        }
    };
    // Pushes key to the key state array if it is
    // not already there
    InputManager.prototype.pushKeyState = function (key) {
        for (var _i = 0, _a = this.keyStates; _i < _a.length; _i++) {
            var e = _a[_i];
            if (e.key == key)
                return;
        }
        this.keyStates.push(new KeyValuePair(key, State.Up));
    };
    InputManager.prototype.addAction = function (name, key, button1, button2) {
        if (button2 === void 0) { button2 = -1; }
        this.actions.push(new InputAction(name, key, button1, button2));
        this.prevent.push(key);
        return this;
    };
    InputManager.prototype.keyPressed = function (key) {
        this.pushKeyState(key);
        if (this.getKeyState(key) != State.Down) {
            this.anyKeyPressed = true;
            this.setKeyState(key, State.Pressed);
        }
        return this.prevent.includes(key);
    };
    InputManager.prototype.keyReleased = function (key) {
        this.pushKeyState(key);
        if (this.getKeyState(key) != State.Up)
            this.setKeyState(key, State.Released);
        return this.prevent.includes(key);
    };
    InputManager.prototype.updateStateArray = function (arr) {
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var a = arr_1[_i];
            if (a.value == State.Pressed)
                a.value = State.Down;
            else if (a.value == State.Released)
                a.value = State.Up;
        }
    };
    InputManager.prototype.updateStick = function () {
        var DEADZONE = 0.25;
        var padStick = this.gamepad.getStick();
        this.oldStick = this.stick.clone();
        this.stick.zeros();
        if (Math.abs(padStick.x) >= DEADZONE ||
            Math.abs(padStick.y) >= DEADZONE) {
            this.stick = padStick;
        }
        else {
            if (this.getAction("right") & State.DownOrPressed) {
                this.stick.x = 1;
            }
            else if (this.getAction("left") & State.DownOrPressed) {
                this.stick.x = -1;
            }
            if (this.getAction("down") & State.DownOrPressed) {
                this.stick.y = 1;
            }
            else if (this.getAction("up") & State.DownOrPressed) {
                this.stick.y = -1;
            }
            // Not suitable for a platformer
            // this.stick.normalize();
        }
        this.stickDelta = new Vector2(this.stick.x - this.oldStick.x, this.stick.y - this.oldStick.y);
    };
    // This one is called before the current scene
    // is "refreshed"
    InputManager.prototype.preUpdate = function () {
        this.gamepad.update();
        for (var _i = 0, _a = this.actions; _i < _a.length; _i++) {
            var a = _a[_i];
            a.state = this.getKeyState(a.key) | State.Up;
            if (a.state == State.Up) {
                if (a.button1 != null)
                    a.state = this.gamepad.getButtonState(a.button1);
                if (a.state == State.Up && a.button2 != null) {
                    a.state = this.gamepad.getButtonState(a.button2);
                }
            }
        }
        this.updateStick();
    };
    // And this one afterwards
    InputManager.prototype.postUpdate = function () {
        this.updateStateArray(this.keyStates);
        this.anyKeyPressed = false;
    };
    //
    // The next functions makes dealing with gamepad
    // easier in menus
    //
    InputManager.prototype.upPress = function () {
        return this.stick.y < 0 &&
            this.oldStick.y >= -INPUT_SPECIAL_EPS &&
            this.stickDelta.y < -INPUT_SPECIAL_EPS;
    };
    InputManager.prototype.downPress = function () {
        return this.stick.y > 0 &&
            this.oldStick.y <= INPUT_SPECIAL_EPS &&
            this.stickDelta.y > INPUT_SPECIAL_EPS;
    };
    InputManager.prototype.leftPress = function () {
        return this.stick.x < 0 &&
            this.oldStick.x >= -INPUT_SPECIAL_EPS &&
            this.stickDelta.x < -INPUT_SPECIAL_EPS;
    };
    InputManager.prototype.rightPress = function () {
        return this.stick.x > 0 &&
            this.oldStick.x <= INPUT_SPECIAL_EPS &&
            this.stickDelta.x > INPUT_SPECIAL_EPS;
    };
    InputManager.prototype.anyPressed = function () {
        return this.anyKeyPressed || this.gamepad.isAnyButtonPressed();
    };
    InputManager.prototype.getStick = function () {
        return this.stick.clone();
    };
    InputManager.prototype.getAction = function (name) {
        for (var _i = 0, _a = this.actions; _i < _a.length; _i++) {
            var e = _a[_i];
            if (e.name == name)
                return e.state;
        }
        return State.Up;
    };
    InputManager.prototype.getKeyState = function (key) {
        for (var _i = 0, _a = this.keyStates; _i < _a.length; _i++) {
            var e = _a[_i];
            if (e.key == key)
                return e.value;
        }
        return State.Up;
    };
    return InputManager;
}());
export { InputManager };
