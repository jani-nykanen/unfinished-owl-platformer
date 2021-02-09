import { KeyValuePair } from "./util.js";
var Tilemap = /** @class */ (function () {
    function Tilemap(xmlString) {
        var doc = (new DOMParser()).parseFromString(xmlString, "text/xml");
        var root = doc.getElementsByTagName("map")[0];
        this.width = Number(root.getAttribute("width"));
        this.height = Number(root.getAttribute("height"));
        // TODO: Get rid of <any>
        var data = root.getElementsByTagName("layer");
        this.layers = new Array();
        // Find the minimal id
        var min = 9999; // "Big number"
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var d = data_1[_i];
            if (d.id < min) {
                min = d.id;
            }
        }
        var str, content;
        var id;
        for (var i = 0; i < data.length; ++i) {
            id = data[i].id - min;
            // Get layer data & remove newlines
            str = data[i].getElementsByTagName("data")[0]
                .childNodes[0]
                .nodeValue
                .replace(/(\r\n|\n|\r)/gm, "");
            content = str.split(",");
            this.layers[id] = new Array();
            for (var j = 0; j < content.length; ++j) {
                this.layers[id][j] = parseInt(content[j]);
            }
        }
        // Read (optional) properties
        this.properties = new Array();
        var prop = root.getElementsByTagName("properties")[0];
        if (prop != undefined) {
            // TODO: Get rid of <any>
            for (var _a = 0, _b = prop.getElementsByTagName("property"); _a < _b.length; _a++) {
                var p = _b[_a];
                if (p.getAttribute("name") != undefined) {
                    this.properties.push(new KeyValuePair(p.getAttribute("name"), p.getAttribute("value")));
                }
            }
        }
    }
    Tilemap.prototype.getTile = function (l, x, y) {
        if (l < 0 || l >= this.layers.length || x < 0 || y < 0 ||
            x >= this.width || y >= this.height)
            return -1;
        return this.layers[l][y * this.width + x];
    };
    Tilemap.prototype.getIndexedTile = function (l, i) {
        if (l < 0 || l >= this.layers.length ||
            i < 0 || i >= this.width * this.height)
            return -1;
        return this.layers[l][i];
    };
    Tilemap.prototype.cloneLayer = function (l) {
        if (l < 0 || l >= this.layers.length)
            return null;
        return Array.from(this.layers[l]);
    };
    return Tilemap;
}());
export { Tilemap };
