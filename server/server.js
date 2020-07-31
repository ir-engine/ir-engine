/* eslint-disable @typescript-eslint/no-var-requires */
const { World } = require("ecsy")
const ARMADA = require("../dist/armada.umd.js")
const world = new World()

ARMADA.initializeNetworking(world)

let lastTime = Date.now()
function update() {
  const time = Date.now()
  const delta = time - lastTime
  lastTime = time
  world.execute(delta)
  setImmediate(update)
}

update()
