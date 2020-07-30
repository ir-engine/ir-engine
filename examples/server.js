import { World } from "ecsy"
import { initializeNetworking } from "../dist/armada.js"
const world = new World()

initializeNetworking(world)

var lastTime = performance.now();
function update() {
  var time = performance.now();
  var delta = time - lastTime;
  lastTime = time;
  world.execute(delta);
  requestAnimationFrame(update);
}

update()