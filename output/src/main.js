import { Core } from "./core.js";
import { GameScene } from "./game.js";
window.onload = function () { return (new Core(256, 192, 0))
    .loadAssets("assets/index.json")
    .run(GameScene); };
