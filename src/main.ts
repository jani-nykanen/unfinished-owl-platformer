import { Core } from "./core.js"
import { GameScene } from "./game.js";


window.onload = () : void => (new Core(256, 192, 0))
    .addInputAction("fire1", "KeyZ", 0)
    .addInputAction("fire2", "KeyX", 1, 2)
    .addInputAction("start", "Enter", 9, 7)
    .addInputAction("back", "Escape", 8, 6)
    .addInputAction("select", "ShiftLeft", 4, 5)
    .loadAssets("assets/index.json")
    .run(GameScene);

