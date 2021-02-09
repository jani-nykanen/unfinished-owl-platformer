import { Core } from "./core.js"
import { GameScene } from "./game.js";


window.onload = () : void => (new Core(256, 192, 0)).run(GameScene);

