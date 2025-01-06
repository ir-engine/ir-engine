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
  Entity,
  EntityTreeComponent,
  removeEntityNodeRecursively,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import {
  TransformComponent,
  TransformGizmoTagComponent
} from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Object3D } from 'three'
import { gizmo, helper, picker, setupGizmo } from '../../../constants/GizmoPresets'
import { EditorHelperState } from '../../../services/EditorHelperState'

export const TransformGizmoVisualComponent = defineComponent({
  name: 'TransformGizmoVisual',

  schema: S.Object({
    gizmo: S.Entity(),
    picker: S.Entity(),
    helper: S.Entity()
  }),

  reactor: function () {
    const gizmoVisualEntity = useEntityContext()
    const visualComponent = useComponent(gizmoVisualEntity, TransformGizmoVisualComponent)
    const mode = useMutableState(EditorHelperState).transformMode.value

    useEffect(() => {
      const entities = [] as Entity[]

      const gizmoEntity = createEntity()
      setComponent(gizmoEntity, ObjectComponent, new Object3D())
      setComponent(gizmoEntity, NameComponent, `gizmoEntity`)
      setComponent(gizmoEntity, TransformGizmoTagComponent)
      setComponent(gizmoEntity, TransformComponent)
      setComponent(gizmoEntity, VisibleComponent)
      setComponent(gizmoEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
      setupGizmo(gizmoEntity, gizmo[mode])
      ObjectLayerMaskComponent.setLayer(gizmoEntity, ObjectLayers.TransformGizmo)
      visualComponent.gizmo.set(gizmoEntity)
      entities.push(gizmoEntity)

      const helperEntity = createEntity()
      setComponent(helperEntity, ObjectComponent, new Object3D())
      setComponent(helperEntity, NameComponent, `gizmoHelperEntity`)
      setComponent(helperEntity, TransformGizmoTagComponent)
      setComponent(helperEntity, VisibleComponent)
      setComponent(helperEntity, TransformComponent)
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
      setupGizmo(helperEntity, helper[mode])
      ObjectLayerMaskComponent.setLayer(helperEntity, ObjectLayers.TransformGizmo)
      visualComponent.helper.set(helperEntity)
      entities.push(helperEntity)

      const pickerEntity = createEntity()
      setComponent(pickerEntity, ObjectComponent, new Object3D())
      setComponent(pickerEntity, NameComponent, `gizmoPickerEntity`)
      setComponent(pickerEntity, TransformGizmoTagComponent)
      setComponent(pickerEntity, VisibleComponent)
      setComponent(pickerEntity, TransformComponent)
      setComponent(pickerEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
      setComponent(pickerEntity, InputComponent)
      setupGizmo(pickerEntity, picker[mode])
      ObjectLayerMaskComponent.setLayer(pickerEntity, ObjectLayers.TransformGizmo)
      visualComponent.picker.set(pickerEntity)
      entities.push(pickerEntity)

      return () => {
        for (const entity of entities) {
          removeEntityNodeRecursively(entity)
        }
      }
    }, [mode])

    return null
  }
})
