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

import {
  createEntity,
  defineComponent,
  Engine,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { addObjectToGroup, removeObjectFromGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformGizmoTagComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Mesh, Object3D } from 'three'
import { cameraGizmo, pickerTranslate, setupGizmo } from '../../../constants/GizmoPresets'

const useCameraGizmoEntities = () => {
  const gizmo = useHookstate(createEntity)

  useEffect(() => {
    return () => {
      removeEntity(gizmo.value)
    }
  }, [])

  return gizmo.value
}

const cleanupGizmo = (gizmoObj: Object3D) => {
  for (const child of gizmoObj.children as Mesh[]) {
    // Only dispose cloned geometry from setupGizmo
    if (child.geometry) child.geometry.dispose()
  }
}

export const CameraGizmoVisualComponent = defineComponent({
  name: 'CameraGizmoVisual',

  schema: S.Object({
    sceneEntity: S.Entity(),
    gizmo: S.Entity(),
    picker: S.Entity()
  }),

  reactor: function (props) {
    const cameraGizmoVisualEntity = useEntityContext()
    const visualComponent = useComponent(cameraGizmoVisualEntity, CameraGizmoVisualComponent)
    const gizmo = useCameraGizmoEntities()
    const picker = useCameraGizmoEntities()

    useEffect(() => {
      // Gizmo creation
      const gizmoObject = setupGizmo(cameraGizmo)
      const pickerObject = setupGizmo(pickerTranslate)

      setComponent(gizmo, NameComponent, `cameraGizmoEntity`)
      addObjectToGroup(gizmo, gizmoObject)
      setComponent(gizmo, TransformGizmoTagComponent)
      setComponent(gizmo, VisibleComponent)
      setComponent(gizmo, EntityTreeComponent, {
        parentEntity:
          visualComponent.sceneEntity.value === UndefinedEntity
            ? Engine.instance.originEntity
            : visualComponent.sceneEntity.value
      })

      visualComponent.gizmo.set(gizmo)

      setComponent(picker, NameComponent, `cameraGizmoPickerEntity`)
      pickerObject.visible = false
      addObjectToGroup(picker, pickerObject)
      setComponent(picker, TransformGizmoTagComponent)
      setComponent(picker, VisibleComponent)
      setComponent(picker, EntityTreeComponent, {
        parentEntity:
          visualComponent.sceneEntity.value === UndefinedEntity
            ? Engine.instance.originEntity
            : visualComponent.sceneEntity.value
      })

      visualComponent.picker.set(picker)

      setComponent(picker, InputComponent)

      return () => {
        removeObjectFromGroup(gizmo, gizmoObject)
        cleanupGizmo(gizmoObject)
        removeObjectFromGroup(picker, pickerObject)
        cleanupGizmo(pickerObject)

        removeEntity(gizmo)
        removeEntity(picker)
      }
    }, [])

    return null
  }
})
