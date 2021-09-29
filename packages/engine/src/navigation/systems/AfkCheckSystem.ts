import { System } from '../../ecs/classes/System'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AfkCheckComponent } from '../component/AfkCheckComponent'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { World } from '../../ecs/classes/World'

const afkTime: number = 0.5
const step: number = 50

export default async function AfkCheckSystem(world: World): Promise<System> {
  const afkQuery = defineQuery([AfkCheckComponent, TransformComponent])

  return () => {
    for (const eid of afkQuery(world)) {
      const { isAfk, prevPosition, cStep } = getComponent(eid, AfkCheckComponent)
      const { position } = getComponent(eid, TransformComponent)

      getComponent(eid, AfkCheckComponent).cStep++
      if (cStep + 1 < step) continue
      getComponent(eid, AfkCheckComponent).cStep = 0

      if (position.distanceTo(prevPosition) <= 0.05) {
        if (!isAfk) {
          getComponent(eid, AfkCheckComponent).timer += world.delta
          if (getComponent(eid, AfkCheckComponent).cStep2 >= afkTime) getComponent(eid, AfkCheckComponent).isAfk = true
        }
      } else {
        getComponent(eid, AfkCheckComponent).cStep2 = 0
        if (isAfk) getComponent(eid, AfkCheckComponent).isAfk = false
      }

      getComponent(eid, AfkCheckComponent).prevPosition.copy(position)
    }
  }
}
