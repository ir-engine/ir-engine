import { defineQuery, defineSystem, System } from 'bitecs'
import { Vector3 } from 'three'
import { goTo } from '@xrengine/common/src/utils/commandHandler'
import { positionBehind } from '@xrengine/common/src/utils/mathUtils'
import { ECSWorld } from '../../ecs/classes/World'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { FollowComponent } from '../component/FollowComponent'

const distanceToPlayer: number = 1
const step: number = 10

export const FollowSystem = async (): Promise<System> => {
  const followQuery = defineQuery([FollowComponent])

  return defineSystem((world: ECSWorld) => {
    for (const eid of followQuery(world)) {
      var { targetEid, cStep, prevTarget } = getComponent(eid, FollowComponent)
      cStep++
      getComponent(eid, FollowComponent).cStep = cStep
      if (cStep < step) continue
      getComponent(eid, FollowComponent).cStep = 0

      const tTransform = getComponent(targetEid, TransformComponent)
      if (tTransform === undefined) return

      const pos: Vector3 = positionBehind(tTransform.position, tTransform.rotation, distanceToPlayer)
      if (pos !== prevTarget) {
        goTo(pos, eid)
        getComponent(eid, FollowComponent).prevTarget = pos
      }
    }

    return world
  })
}
