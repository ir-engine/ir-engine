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
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getState, useHookstate } from '@ir-engine/hyperflux'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { CameraGizmoTagComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { addObjectToGroup, removeObjectFromGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { Mesh, Object3D } from 'three'
import { enableObjectLayer } from '../../../../../spatial/src/renderer/components/ObjectLayerComponent'
import { cameraGizmo, cameraPicker, setupGizmo } from '../../../constants/GizmoPresets'

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
    sceneEntity: T.Entity(),
    gizmo: T.Entity(),
    picker: T.Entity()
  }),

  reactor: function (props) {
    const cameraGizmoVisualEntity = useEntityContext()
    const visualComponent = useComponent(cameraGizmoVisualEntity, CameraGizmoVisualComponent)
    const gizmo = useCameraGizmoEntities()
    const picker = useCameraGizmoEntities()

    useEffect(() => {
      // Gizmo creation
      const gizmoObject = setupGizmo(cameraGizmo)
      const pickerObject = setupGizmo(cameraPicker)

      setComponent(gizmo, NameComponent, `cameraGizmoMeshEntity`)
      addObjectToGroup(gizmo, gizmoObject)
      setComponent(gizmo, CameraGizmoTagComponent)
      setComponent(gizmo, VisibleComponent)
      setComponent(gizmo, EntityTreeComponent, {
        parentEntity: visualComponent.sceneEntity.value ?? getState(EngineState).originEntity
      })

      visualComponent.gizmo.set(gizmo)

      setComponent(picker, NameComponent, `cameraGizmoPickerMeshEntity`)
      pickerObject.visible = false
      addObjectToGroup(picker, pickerObject)
      setComponent(picker, CameraGizmoTagComponent)
      setComponent(picker, VisibleComponent)
      setComponent(picker, EntityTreeComponent, {
        parentEntity: visualComponent.sceneEntity.value ?? getState(EngineState).originEntity
      })
      /**todo can't seem to get the new method of setting layers to work on either pciker or gizmo entity)*/
      // setComponent(picker, ObjectLayerMaskComponent, ObjectLayers.Gizmos)
      enableObjectLayer(pickerObject, ObjectLayers.Gizmos, true)

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
