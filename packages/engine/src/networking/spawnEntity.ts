import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { dispatchAction } from '@etherealengine/hyperflux'
import { Mesh, Quaternion, Vector3 } from 'three'
import { setComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { addObjectToGroup } from '../scene/components/GroupComponent'
import { ModelComponent } from '../scene/components/ModelComponent'
import { NameComponent } from '../scene/components/NameComponent'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { WorldNetworkAction } from './functions/WorldNetworkAction'

type SpawnEntityOptions = {
  uuid: EntityUUID
  name: string
  // parent?: EntityUUID
  // prefab?: string
  position?: Vector3
  rotation?: Quaternion
  mesh?: string | Mesh
  // collider:
}

export const spawnEntity = (options: SpawnEntityOptions) => {
  const entity = createEntity()

  setComponent(entity, UUIDComponent, options.uuid)
  setComponent(entity, NameComponent, options.name)

  setComponent(entity, TransformComponent, {
    position: options.position,
    rotation: options.rotation
  })

  if (options.mesh) {
    if (typeof options.mesh === 'string') {
      setComponent(entity, ModelComponent, { src: options.mesh })
    } else {
      addObjectToGroup(entity, options.mesh)
    }
  }

  dispatchAction(
    WorldNetworkAction.spawnObject({
      entityUUID: options.uuid,
      prefab: '',
      position: options.position,
      rotation: options.rotation
    })
  )

  return entity
}
