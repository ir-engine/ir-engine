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
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { TransformMode } from '@ir-engine/engine/src/scene/constants/transformConstants'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import {
  EntityTreeComponent,
  iterateEntityNode,
  removeEntityNodeRecursively
} from '@ir-engine/spatial/src/transform/components/EntityTree'
import {
  TransformComponent,
  TransformGizmoTagComponent
} from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Object3D } from 'three'
import { gizmoTranslate, helperTranslate, pickerTranslate, setupGizmo } from '../../../constants/GizmoPresets'

export const TransformGizmoVisualComponent = defineComponent({
  name: 'TransformGizmoVisual',

  schema: S.Object({
    gizmo: S.Object({
      translate: S.Entity(),
      rotate: S.Entity(),
      scale: S.Entity()
    }),
    picker: S.Object({
      translate: S.Entity(),
      rotate: S.Entity(),
      scale: S.Entity()
    }),
    helper: S.Object({
      translate: S.Entity(),
      rotate: S.Entity(),
      scale: S.Entity()
    })
  }),

  reactor: function () {
    const gizmoVisualEntity = useEntityContext()
    const visualComponent = useComponent(gizmoVisualEntity, TransformGizmoVisualComponent)

    useEffect(() => {
      const entities = [] as Entity[]

      for (const mode in TransformMode) {
        const gizmoEntity = createEntity()
        setComponent(gizmoEntity, ObjectComponent, new Object3D())
        setComponent(gizmoEntity, NameComponent, `gizmo${mode}Entity`)
        setComponent(gizmoEntity, TransformGizmoTagComponent)
        setComponent(gizmoEntity, TransformComponent)
        setComponent(gizmoEntity, VisibleComponent)
        setComponent(gizmoEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
        setupGizmo(gizmoEntity, gizmoTranslate)
        ObjectLayerMaskComponent.setLayer(gizmoEntity, ObjectLayers.TransformGizmo)
        visualComponent.gizmo[mode].set(gizmoEntity)
        entities.push(gizmoEntity)

        const helperEntity = createEntity()
        setComponent(helperEntity, ObjectComponent, new Object3D())
        setComponent(helperEntity, NameComponent, `gizmoHelper${mode}Entity`)
        setComponent(helperEntity, TransformGizmoTagComponent)
        setComponent(helperEntity, VisibleComponent)
        setComponent(helperEntity, TransformComponent)
        setComponent(helperEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
        setupGizmo(helperEntity, helperTranslate)
        ObjectLayerMaskComponent.setLayer(helperEntity, ObjectLayers.TransformGizmo)
        visualComponent.helper[mode].set(helperEntity)
        entities.push(helperEntity)

        const pickerEntity = createEntity()
        setComponent(pickerEntity, ObjectComponent, new Object3D())
        setComponent(pickerEntity, NameComponent, `gizmoPicker${mode}Entity`)
        setComponent(pickerEntity, TransformGizmoTagComponent)
        setComponent(pickerEntity, VisibleComponent)
        setComponent(pickerEntity, TransformComponent)
        setComponent(pickerEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
        setupGizmo(pickerEntity, pickerTranslate)
        ObjectLayerMaskComponent.setLayer(pickerEntity, ObjectLayers.TransformGizmo)
        visualComponent.picker[mode].set(pickerEntity)
        entities.push(pickerEntity)

        iterateEntityNode(pickerEntity, (entity) => {
          setComponent(entity, InputComponent)
        })
      }

      return () => {
        for (const entity of entities) {
          removeEntityNodeRecursively(entity)
        }
      }
    }, [])

    return null
  }
})
