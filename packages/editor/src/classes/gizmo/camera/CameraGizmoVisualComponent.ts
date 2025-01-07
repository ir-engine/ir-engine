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
  EntityTreeComponent,
  createEntity,
  defineComponent,
  removeEntityNodeRecursively,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { CameraGizmoTagComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { Object3D } from 'three'
import { cameraGizmo, cameraPicker, setupGizmo } from '../../../constants/GizmoPresets'

export const CameraGizmoVisualComponent = defineComponent({
  name: 'CameraGizmoVisual',

  schema: S.Object({
    sceneEntity: S.Entity(),
    gizmo: S.Entity(),
    picker: S.Entity()
  }),

  reactor: function () {
    const cameraGizmoVisualEntity = useEntityContext()
    const visualComponent = useComponent(cameraGizmoVisualEntity, CameraGizmoVisualComponent)

    useEffect(() => {
      const gizmo = createEntity()
      const picker = createEntity()
      setComponent(gizmo, ObjectComponent, new Object3D())
      setComponent(gizmo, NameComponent, `cameraGizmoMeshEntity`)
      setComponent(gizmo, CameraGizmoTagComponent)
      setComponent(gizmo, VisibleComponent)
      setComponent(gizmo, EntityTreeComponent, {
        parentEntity: visualComponent.sceneEntity.value ?? getState(ReferenceSpaceState).originEntity
      })
      setupGizmo(gizmo, cameraGizmo)

      visualComponent.gizmo.set(gizmo)

      setComponent(picker, ObjectComponent, new Object3D())
      setComponent(picker, NameComponent, `cameraGizmoPickerMeshEntity`)
      setComponent(picker, CameraGizmoTagComponent)
      setComponent(picker, EntityTreeComponent, {
        parentEntity: visualComponent.sceneEntity.value ?? getState(ReferenceSpaceState).originEntity
      })
      setupGizmo(picker, cameraPicker)

      visualComponent.picker.set(picker)

      setComponent(picker, InputComponent)

      return () => {
        removeEntityNodeRecursively(gizmo)
        removeEntityNodeRecursively(picker)
      }
    }, [])

    return null
  }
})
