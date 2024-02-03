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

import { defineComponent, removeComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'

import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { useEffect } from 'react'
import { TransformGizmoControlComponent } from './TransformGizmoControlComponent'
import { TransformGizmoVisualComponent } from './TransformGizmoVisualComponent'

export const TransformGizmoControlledComponent = defineComponent({
  name: 'TransformGizmoControlled',

  onInit(entity) {
    return null
  },
  onRemove: (entity, component) => {},
  reactor: function (props) {
    const entity = useEntityContext()
    const gizmoControlEntity = createEntity()
    const gizmoVisualEntity = createEntity()
    const gizmoPlaneEntity = createEntity()
    useEffect(() => {
      setComponent(gizmoControlEntity, NameComponent, 'gizmoEntity')
      setComponent(gizmoControlEntity, VisibleComponent)
      setComponent(gizmoControlEntity, TransformGizmoControlComponent, {
        controlledEntity: entity,
        visualEntity: gizmoVisualEntity,
        planeEntity: gizmoPlaneEntity
      })

      setComponent(gizmoVisualEntity, NameComponent, 'gizmoVisualEntity')
      setComponent(gizmoVisualEntity, TransformGizmoVisualComponent)
      setComponent(gizmoVisualEntity, VisibleComponent)

      setComponent(gizmoPlaneEntity, NameComponent, 'gizmoPlaneEntity')
      setComponent(gizmoPlaneEntity, VisibleComponent)

      return () => {
        removeComponent(gizmoVisualEntity, TransformGizmoVisualComponent)
        removeEntity(gizmoControlEntity)
        removeEntity(gizmoVisualEntity)
        removeEntity(gizmoPlaneEntity)
      }
    }, [])

    return null
  }
})
