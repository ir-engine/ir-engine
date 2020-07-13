import { createQuery, tag, World } from "@javelin/ecs"
import { Position } from "../../jav/src/common/components"
import { createJunk } from "../../jav/src/server/entities"
import { Tags } from "../ServerTags"

let elapsed = 0

const asleep = createQuery(Position).filter(tag(Tags.Awake, false))

export function spawn(dt: number, world: World) {
  elapsed += Math.max(dt, 0)
  if (elapsed > 1000) {
    elapsed = 0
    for (let i = 0; i < 10; i++) {
      createJunk(world)
    }
    let i = 0
    for (const [{ _e }] of world.query(asleep)) {
      world.destroy(_e)
      if (++i >= 10) break
    }
  }
}
