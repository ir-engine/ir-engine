/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'

import { Engine } from '@ir-engine/ecs'
import { defineComponent, removeComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { CameraGizmoTagComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { CameraGizmoControlComponent } from './CameraGizmoControlComponent'
import { CameraGizmoVisualComponent } from './CameraGizmoVisualComponent'

// camera synced to the visual entity
export const CameraGizmoControlledComponent = defineComponent({
  name: 'CameraGizmoControlled',

  schema: S.Object({ controller: S.Entity() }),

  reactor: function (props) {
    const entity = useEntityContext()
    const transformGizmoControlledComponent = useComponent(entity, CameraGizmoControlledComponent)

    useEffect(() => {
      const gizmoControlEntity = createEntity()
      const gizmoVisualEntity = createEntity()

      setComponent(gizmoControlEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
      setComponent(gizmoVisualEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })

      const controlledEntities = [entity]
      setComponent(gizmoControlEntity, NameComponent, 'CameraGizmoControllerEntity')
      setComponent(gizmoControlEntity, CameraGizmoControlComponent, {
        controlledCameras: controlledEntities,
        visualEntity: gizmoVisualEntity
      })
      setComponent(gizmoControlEntity, CameraGizmoTagComponent)
      setComponent(gizmoControlEntity, VisibleComponent)

      transformGizmoControlledComponent.controller.set(gizmoControlEntity)

      setComponent(gizmoVisualEntity, NameComponent, 'cameraGizmoVisualEntity')
      setComponent(gizmoVisualEntity, CameraGizmoVisualComponent)
      setComponent(gizmoVisualEntity, CameraGizmoTagComponent)
      setComponent(gizmoVisualEntity, VisibleComponent)

      return () => {
        removeEntity(gizmoControlEntity)
        removeComponent(gizmoVisualEntity, CameraGizmoVisualComponent)
        removeEntity(gizmoVisualEntity)
      }
    }, [])

    return null
  }
})
