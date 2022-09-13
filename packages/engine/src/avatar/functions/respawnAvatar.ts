import { Quaternion, Vector3 } from 'three'

import { dispatchAction } from '@xrengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { SpawnPoseComponent } from '../components/SpawnPoseComponent'

export const respawnAvatar = (entity: Entity) => {
  const { position } = getComponent(entity, SpawnPoseComponent)
  const networkObject = getComponent(entity, NetworkObjectComponent)
  dispatchAction(
    WorldNetworkAction.teleportObject({
      object: {
        ownerId: networkObject.ownerId,
        networkId: networkObject.networkId
      },
      position: new Vector3(position.x, position.y + 1, position.z),
      rotation: new Quaternion()
    })
  )
}
