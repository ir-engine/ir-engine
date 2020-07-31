import { World } from "ecsy"
import { initializeNetworking } from "../../index"
const world = new World()

initializeNetworking(world)

let lastTime = Date.now()
function update() {
  const time = Date.now()
  const delta = time - lastTime
  lastTime = time
  world.execute(delta)
  setImmediate(update)
}

update()
