import { Tilemap } from "./tilemap.js";
import { KeyValuePair } from "./util.js";
var AssetContainer = /** @class */ (function () {
    function AssetContainer() {
        this.assets = new Array();
    }
    AssetContainer.prototype.getAsset = function (name) {
        for (var _i = 0, _a = this.assets; _i < _a.length; _i++) {
            var a = _a[_i];
            if (a.key == name)
                return a.value;
        }
        return null;
    };
    AssetContainer.prototype.addAsset = function (name, data) {
        this.assets.push(new KeyValuePair(name, data));
    };
    return AssetContainer;
}());
export { AssetContainer };
var AssetManager = /** @class */ (function () {
    function AssetManager() {
        this.bitmaps = new AssetContainer();
        this.tilemaps = new AssetContainer();
        this.total = 0;
        this.loaded = 0;
    }
    AssetManager.prototype.loadTextfile = function (path, type, cb) {
        var _this = this;
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("text/" + type);
        xobj.open("GET", path, true);
        ++this.total;
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4) {
                if (String(xobj.status) == "200") {
                    if (cb != undefined)
                        cb(xobj.responseText);
                }
                ++_this.loaded;
            }
        };
        xobj.send(null);
    };
    AssetManager.prototype.loadBitmap = function (name, url) {
        var _this = this;
        ++this.total;
        var image = new Image();
        image.onload = function () {
            ++_this.loaded;
            _this.bitmaps.addAsset(name, image);
        };
        image.src = url;
    };
    AssetManager.prototype.loadTilemap = function (name, url) {
        var _this = this;
        ++this.total;
        this.loadTextfile(url, "xml", function (str) {
            _this.tilemaps.addAsset(name, new Tilemap(str));
            ++_this.loaded;
        });
    };
    AssetManager.prototype.hasLoaded = function () {
        return this.loaded >= this.total;
    };
    AssetManager.prototype.getBitmap = function (name) {
        return this.bitmaps.getAsset(name);
    };
    AssetManager.prototype.getTilemap = function (name) {
        return this.tilemaps.getAsset(name);
    };
    AssetManager.prototype.dataLoadedUnit = function () {
        return this.total == 0 ? 1.0 : this.loaded / this.total;
    };
    return AssetManager;
}());
export { AssetManager };
