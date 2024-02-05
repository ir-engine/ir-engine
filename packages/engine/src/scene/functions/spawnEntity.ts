/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { createEntity, setComponent } from '@etherealengine/ecs'
import { dispatchAction } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { WorldNetworkAction } from '@etherealengine/spatial/src/networking/functions/WorldNetworkAction'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { Mesh, Quaternion, Vector3 } from 'three'
import { ModelComponent } from '../components/ModelComponent'

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
      position: options.position,
      rotation: options.rotation
    })
  )

  return entity
}
