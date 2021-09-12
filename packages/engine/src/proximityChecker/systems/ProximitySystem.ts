import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../../networking/classes/Network'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ProximityCheckerComponent } from '../components/ProximityCheckerComponent'
import { forwardVector3, multiplyQuaternion, normalize, subVector } from '@xrengine/common/src/utils/mathUtils'
import { isEntityLocal } from '../../networking/utils/isPlayerLocal'
import { getUserId } from '../../networking/utils/getUser'
import { System } from '../../ecs/classes/System'

const maxDistance: number = 10

export default async function ProximitySystem(world: World): Promise<System> {
  const proximityCheckerQuery = defineQuery([TransformComponent, ProximityCheckerComponent])

  return () => {
    for (const eid of proximityCheckerQuery(world)) {
      if (isEntityLocal(eid)) {
        const userId = getUserId(eid)
        const transform = getComponent(eid, TransformComponent)
        let remoteTransform
        let distance: number = -1
        let dot: number = -1

        for (const id in Network.instance.networkObjects) {
          const object = Network.instance.networkObjects[id]
          if (!object || object.uniqueId === userId) continue

          remoteTransform = getComponent(object.entity, TransformComponent)
          if (remoteTransform === undefined) continue

          distance = transform.position.distanceTo(remoteTransform.position)
          if (distance > 0 && distance <= maxDistance) {
            console.log('remote user id nearby with eid: ' + object.entity + ' distance: ' + distance)
          }

          const forward = multiplyQuaternion(transform.rotation, forwardVector3)
          const toOther = normalize(subVector(remoteTransform.position, transform.position))
          dot = forward.dot(toOther)
          if (dot >= 0.7) {
            console.log('remote user id nearby with eid: ' + object.entity + ' dot: ' + dot)
          }
        }
      }
    }
  }
}
