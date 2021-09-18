import { Vector3 } from 'three'
import { positionBehind } from '@xrengine/common/src/utils/mathUtils'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { FollowComponent } from '../component/FollowComponent'
import { goTo } from '../../common/functions/commandHandler'
import { World } from '../../ecs/classes/World'
import { System } from '../../ecs/classes/System'

const distanceToPlayer: number = 1
const step: number = 10

export default async function FollowSystem(world: World): Promise<System> {
  const followQuery = defineQuery([FollowComponent])

  return () => {
    for (const eid of followQuery(world)) {
      let { targetEid, cStep, prevTarget } = getComponent(eid, FollowComponent)
      cStep++
      getComponent(eid, FollowComponent).cStep = cStep
      if (cStep < step) continue
      getComponent(eid, FollowComponent).cStep = 0

      const tTransform = getComponent(targetEid, TransformComponent)
      if (tTransform !== undefined) {
        const pos: Vector3 = positionBehind(tTransform.position, tTransform.rotation, distanceToPlayer)
        if (pos !== prevTarget) {
          goTo(pos, eid)
          getComponent(eid, FollowComponent).prevTarget = pos
        }
      }
    }
  }
}
