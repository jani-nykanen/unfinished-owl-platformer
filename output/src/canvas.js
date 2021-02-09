import { clamp } from "./util.js";
import { Vector2 } from "./vector.js";
export var Flip;
(function (Flip) {
    Flip[Flip["None"] = 0] = "None";
    Flip[Flip["Horizontal"] = 1] = "Horizontal";
    Flip[Flip["Vertical"] = 2] = "Vertical";
    Flip[Flip["Both"] = 3] = "Both";
})(Flip || (Flip = {}));
;
var Canvas = /** @class */ (function () {
    function Canvas(width, height, assets) {
        var _this = this;
        this.width = width;
        this.height = height;
        this.translation = new Vector2();
        this.assets = assets;
        this.createHtml5Canvas(width, height);
        window.addEventListener("resize", function () { return _this.resize(window.innerWidth, window.innerHeight); });
    }
    Canvas.prototype.createHtml5Canvas = function (width, height) {
        var cdiv = document.createElement("div");
        cdiv.setAttribute("style", "position: absolute; top: 0; left: 0; z-index: -1;");
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.setAttribute("style", "position: absolute; top: 0; left: 0; z-index: -1;" +
            "image-rendering: optimizeSpeed;" +
            "image-rendering: pixelated;" +
            "image-rendering: -moz-crisp-edges;");
        cdiv.appendChild(this.canvas);
        document.body.appendChild(cdiv);
        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
        this.resize(window.innerWidth, window.innerHeight);
    };
    Canvas.prototype.getColorString = function (r, g, b, a) {
        if (a === void 0) { a = 1.0; }
        return "rgba(" + String(r | 0) + "," +
            String(g | 0) + "," +
            String(b | 0) + "," +
            String(clamp(a, 0.0, 1.0));
    };
    Canvas.prototype.resize = function (width, height) {
        var c = this.canvas;
        // Find the best multiplier for
        // square pixels (unless too small for that)
        var mul = Math.min(width / c.width, height / c.height);
        if (mul >= 1.0) {
            mul = Math.floor(mul);
        }
        var totalWidth = c.width * mul;
        var totalHeight = c.height * mul;
        var x = width / 2 - totalWidth / 2;
        var y = height / 2 - totalHeight / 2;
        var top = String(y | 0) + "px";
        var left = String(x | 0) + "px";
        c.style.width = String(totalWidth | 0) + "px";
        c.style.height = String(totalHeight | 0) + "px";
        c.style.top = top;
        c.style.left = left;
    };
    Canvas.prototype.moveTo = function (x, y) {
        if (x === void 0) { x = 0.0; }
        if (y === void 0) { y = 0.0; }
        this.translation.x = x | 0;
        this.translation.y = y | 0;
    };
    Canvas.prototype.move = function (x, y) {
        this.translation.x += x | 0;
        this.translation.y += y | 0;
    };
    Canvas.prototype.clear = function (r, g, b) {
        this.ctx.fillStyle = this.getColorString(r, g, b);
        this.ctx.fillRect(0, 0, this.width, this.height);
    };
    Canvas.prototype.setFillColor = function (r, g, b, a) {
        if (g === void 0) { g = r; }
        if (b === void 0) { b = g; }
        if (a === void 0) { a = 1.0; }
        var colorStr = this.getColorString(r, g, b, a);
        this.ctx.fillStyle = colorStr;
        // this.ctx.strokeStyle = colorStr;
    };
    Canvas.prototype.setGlobalAlpha = function (a) {
        if (a === void 0) { a = 1.0; }
        this.ctx.globalAlpha = clamp(a, 0, 1);
    };
    Canvas.prototype.fillRect = function (x, y, w, h) {
        x += this.translation.x;
        y += this.translation.y;
        this.ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
    };
    Canvas.prototype.drawBitmap = function (bmp, dx, dy, flip) {
        if (flip === void 0) { flip = Flip.None; }
        this.drawBitmapRegion(bmp, 0, 0, bmp.width, bmp.height, dx, dy, flip);
    };
    Canvas.prototype.drawBitmapRegion = function (bmp, sx, sy, sw, sh, dx, dy, flip) {
        if (flip === void 0) { flip = Flip.None; }
        this.drawScaledBitmapRegion(bmp, sx, sy, sw, sh, dx, dy, sw, sh, flip);
    };
    Canvas.prototype.drawScaledBitmapRegion = function (bmp, sx, sy, sw, sh, dx, dy, dw, dh, flip) {
        if (flip === void 0) { flip = Flip.None; }
        if (bmp == null || sw <= 0 || sh <= 0)
            return;
        var c = this.ctx;
        dx += this.translation.x;
        dy += this.translation.y;
        sx |= 0;
        sy |= 0;
        sw |= 0;
        sh |= 0;
        dx |= 0;
        dy |= 0;
        dw |= 0;
        dh |= 0;
        flip = flip | Flip.None;
        if (flip != Flip.None) {
            c.save();
        }
        if ((flip & Flip.Horizontal) != 0) {
            c.translate(dw, 0);
            c.scale(-1, 1);
            dx *= -1;
        }
        if ((flip & Flip.Vertical) != 0) {
            c.translate(0, dh);
            c.scale(1, -1);
            dy *= -1;
        }
        c.drawImage(bmp, sx, sy, sw, sh, dx, dy, dw, dh);
        if (flip != Flip.None) {
            c.restore();
        }
    };
    Canvas.prototype.drawText = function (font, str, dx, dy, xoff, yoff, center) {
        if (xoff === void 0) { xoff = 0.0; }
        if (yoff === void 0) { yoff = 0.0; }
        if (center === void 0) { center = false; }
        var cw = (font.width / 16) | 0;
        var ch = cw;
        var x = dx;
        var y = dy;
        var c;
        if (center) {
            dx -= (str.length * (cw + xoff)) / 2.0;
            x = dx;
        }
        for (var i = 0; i < str.length; ++i) {
            c = str.charCodeAt(i);
            if (c == '\n'.charCodeAt(0)) {
                x = dx;
                y += ch + yoff;
                continue;
            }
            this.drawBitmapRegion(font, (c % 16) * cw, ((c / 16) | 0) * ch, cw, ch, x, y, Flip.None);
            x += cw + xoff;
        }
    };
    Canvas.prototype.drawSpriteFrame = function (spr, bmp, column, row, dx, dy, flip) {
        if (flip === void 0) { flip = Flip.None; }
        spr.drawFrame(this, bmp, column, row, dx, dy, flip);
    };
    Canvas.prototype.drawSprite = function (spr, bmp, dx, dy, flip) {
        if (flip === void 0) { flip = Flip.None; }
        spr.draw(this, bmp, dx, dy, flip);
    };
    Canvas.prototype.getBitmap = function (name) {
        return this.assets.getBitmap(name);
    };
    return Canvas;
}());
export { Canvas };
