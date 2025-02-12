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
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { TransformMode } from '@ir-engine/engine/src/scene/constants/transformConstants'
import { useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { addObjectToGroup, removeObjectFromGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformGizmoTagComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Mesh, Object3D } from 'three'
import {
  ObjectLayerComponents,
  setObjectLayers
} from '../../../../../spatial/src/renderer/components/ObjectLayerComponent'
import {
  gizmoRotate,
  gizmoScale,
  gizmoTranslate,
  helperRotate,
  helperScale,
  helperTranslate,
  pickerRotate,
  pickerScale,
  pickerTranslate,
  setupGizmo
} from '../../../constants/GizmoPresets'

const useTranslateRotateScaleEntities = () => {
  const translate = useHookstate(createEntity)
  const rotate = useHookstate(createEntity)
  const scale = useHookstate(createEntity)

  useEffect(() => {
    return () => {
      removeEntity(translate.value)
      removeEntity(rotate.value)
      removeEntity(scale.value)
    }
  }, [])

  return {
    translate: translate.value,
    rotate: rotate.value,
    scale: scale.value
  }
}

const cleanupGizmo = (gizmoObj: Object3D) => {
  for (const child of gizmoObj.children as Mesh[]) {
    // Only dispose cloned geometry from setupGizmo
    if (child.geometry) child.geometry.dispose()
  }
}

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

  reactor: function (props) {
    const gizmoVisualEntity = useEntityContext()
    const visualComponent = useComponent(gizmoVisualEntity, TransformGizmoVisualComponent)
    const gizmo = useTranslateRotateScaleEntities()
    const picker = useTranslateRotateScaleEntities()
    const helper = useTranslateRotateScaleEntities()

    useEffect(() => {
      // Gizmo creation
      const gizmoObject = {}
      const pickerObject = {}
      const helperObject = {}

      gizmoObject[TransformMode.translate] = setupGizmo(gizmoTranslate)
      gizmoObject[TransformMode.rotate] = setupGizmo(gizmoRotate)
      gizmoObject[TransformMode.scale] = setupGizmo(gizmoScale)

      pickerObject[TransformMode.translate] = setupGizmo(pickerTranslate)
      pickerObject[TransformMode.rotate] = setupGizmo(pickerRotate)
      pickerObject[TransformMode.scale] = setupGizmo(pickerScale)

      helperObject[TransformMode.translate] = setupGizmo(helperTranslate)
      helperObject[TransformMode.rotate] = setupGizmo(helperRotate)
      helperObject[TransformMode.scale] = setupGizmo(helperScale)
      for (const mode in TransformMode) {
        setComponent(gizmo[mode], NameComponent, `gizmo${mode}Entity`)
        addObjectToGroup(gizmo[mode], gizmoObject[mode])
        setComponent(gizmo[mode], TransformGizmoTagComponent)
        setComponent(gizmo[mode], VisibleComponent)
        setComponent(gizmo[mode], EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
        setComponent(gizmo[mode], ObjectLayerComponents[ObjectLayers.TransformGizmo])
        setObjectLayers(gizmoObject[mode], ObjectLayers.TransformGizmo)

        visualComponent.gizmo[mode].set(gizmo[mode])

        setComponent(helper[mode], NameComponent, `gizmoHelper${mode}Entity`)
        addObjectToGroup(helper[mode], helperObject[mode])
        setComponent(helper[mode], TransformGizmoTagComponent)
        setComponent(helper[mode], VisibleComponent)
        setComponent(helper[mode], EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
        setComponent(helper[mode], ObjectLayerComponents[ObjectLayers.TransformGizmo])
        setObjectLayers(helperObject[mode], ObjectLayers.TransformGizmo)
        visualComponent.helper[mode].set(helper[mode])

        setComponent(picker[mode], NameComponent, `gizmoPicker${mode}Entity`)
        pickerObject[mode].visible = false
        addObjectToGroup(picker[mode], pickerObject[mode])
        setComponent(picker[mode], TransformGizmoTagComponent)
        setComponent(picker[mode], VisibleComponent)
        setComponent(picker[mode], EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
        setComponent(picker[mode], ObjectLayerComponents[ObjectLayers.TransformGizmo])
        setObjectLayers(pickerObject[mode], ObjectLayers.TransformGizmo)

        visualComponent.picker[mode].set(picker[mode])

        setComponent(picker[mode], InputComponent)
      }

      return () => {
        for (const mode in TransformMode) {
          removeObjectFromGroup(gizmo[mode], gizmoObject[mode])
          cleanupGizmo(gizmoObject[mode])
          removeObjectFromGroup(picker[mode], pickerObject[mode])
          cleanupGizmo(pickerObject[mode])
          removeObjectFromGroup(helper[mode], helperObject[mode])
          cleanupGizmo(helperObject[mode])

          removeEntity(gizmo[mode])
          removeEntity(picker[mode])
          removeEntity(helper[mode])
        }
      }
    }, [])

    return null
  }
})
