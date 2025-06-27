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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'

import {
  createEntity,
  defineComponent,
  Entity,
  EntityTreeComponent,
  getOptionalComponent,
  hasComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useEntityContext
} from '@ir-engine/ecs'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import {
  TransformAxis,
  TransformMode,
  TransformPivot,
  TransformSpace
} from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { InputComponent, InputExecutionOrder } from '@ir-engine/spatial/src/input/components/InputComponent'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { TransformGizmoTagComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import {
  onPointerDown,
  onPointerDrag,
  onPointerHover,
  onPointerUp,
  transformGizmoUpdate
} from '../../../functions/gizmos/transformGizmoHelper'
import { TransformGizmoVisualComponent } from './TransformGizmoVisualComponent'

const gizmoPlane = new Mesh(
  new PlaneGeometry(100000, 100000, 2, 2),
  new MeshBasicMaterial({
    visible: false,
    wireframe: true,
    side: DoubleSide,
    transparent: true,
    opacity: 0.1,
    toneMapped: false
  })
)

const createTransformGizmoVisualEntity = (originEntity) => {
  const gizmoVisualEntity = createEntity()
  setComponent(gizmoVisualEntity, EntityTreeComponent, { parentEntity: originEntity })
  setComponent(gizmoVisualEntity, NameComponent, 'transformGizmoVisualEntity')
  setComponent(gizmoVisualEntity, TransformGizmoVisualComponent)
  setComponent(gizmoVisualEntity, TransformGizmoTagComponent)
  setComponent(gizmoVisualEntity, VisibleComponent)
  setComponent(gizmoVisualEntity, TransformComponent)
  setComponent(gizmoVisualEntity, InputComponent)
  ObjectLayerMaskComponent.setLayer(gizmoVisualEntity, ObjectLayers.TransformGizmo)

  return gizmoVisualEntity
}

const createTransformGizmoPlaneEntity = (originEntity) => {
  const gizmoPlaneEntity = createEntity()
  setComponent(gizmoPlaneEntity, EntityTreeComponent, { parentEntity: originEntity })
  setComponent(gizmoPlaneEntity, NameComponent, 'transformGizmoPlaneEntity')
  setComponent(gizmoPlaneEntity, TransformComponent)
  setComponent(gizmoPlaneEntity, VisibleComponent)
  setComponent(gizmoPlaneEntity, MeshComponent, gizmoPlane)
  //setComponent(gizmoPlaneEntity, TransformGizmoTagComponent) remove the gizmo plane from being considered in theheuristic , we use TransformGizmoTagComponent query to collect gizmo entities for heuristic
  ObjectLayerMaskComponent.setLayer(gizmoPlaneEntity, ObjectLayers.TransformGizmo)

  return gizmoPlaneEntity
}

const createTransformGizmoPivotEntity = (originEntity) => {
  const pivotEntity = createEntity()

  setComponent(pivotEntity, EntityTreeComponent, { parentEntity: originEntity })
  setComponent(pivotEntity, NameComponent, 'transformGizmoPivotEntity')
  setComponent(pivotEntity, TransformComponent)
  setComponent(pivotEntity, VisibleComponent)
  setComponent(pivotEntity, TransformGizmoTagComponent)
  return pivotEntity
}

export const TransformGizmoControlComponent = defineComponent({
  name: 'TransformGizmoControlComponent',

  schema: S.Object({
    controlledEntities: S.Array(S.Entity()),
    visualEntity: S.Entity(),
    planeEntity: S.Entity(),
    pivotEntity: S.Entity(),
    dragging: S.Bool({ default: false }),
    axis: S.Union([S.Null(), S.LiteralUnion(Object.values(TransformAxis))]),
    space: S.LiteralUnion(Object.values(TransformSpace), { default: TransformSpace.world }),
    mode: S.LiteralUnion(Object.values(TransformMode), { default: TransformMode.translate }),
    transformPivot: S.LiteralUnion(Object.values(TransformPivot), { default: TransformPivot.FirstSelected }),
    translationSnap: S.Union([S.Null(), S.Number()]),
    rotationSnap: S.Union([S.Null(), S.Number()]),
    scaleSnap: S.Union([S.Null(), S.Number()]),
    size: S.Number({ default: 1 }),
    showX: S.Bool({ default: true }),
    showY: S.Bool({ default: true }),
    showZ: S.Bool({ default: true }),
    pivotBounds: T.Box3(),
    pivotStartPosition: T.Vec3(),
    pivotStartRotation: T.Quaternion(),
    pointerPlaneStartPosition: T.Vec3(),
    pointerPlaneEndPosition: T.Vec3(),
    rotationAxis: T.Vec3(),
    rotationAngle: S.Number({ default: 0 }),
    eye: T.Vec3()
  }),

  useControlEntities: (controlledEntities: Entity[]) => {
    const originEntity = useMutableState(ReferenceSpaceState).originEntity.value
    const controlledEntity = controlledEntities[0]
    const gizmoEntity = useHookstate(UndefinedEntity)

    useEffect(() => {
      if (!originEntity) return

      // create the entities once
      const gizmoVisualEntity = createTransformGizmoVisualEntity(originEntity)
      const gizmoPlaneEntity = createTransformGizmoPlaneEntity(originEntity)
      const pivotEntity = createTransformGizmoPivotEntity(originEntity)

      const gizmoControlEntity = createEntity()
      setComponent(gizmoControlEntity, EntityTreeComponent, { parentEntity: originEntity })
      setComponent(gizmoControlEntity, NameComponent, 'gizmoControlEntity')
      setComponent(gizmoControlEntity, TransformGizmoControlComponent, {
        visualEntity: gizmoVisualEntity,
        planeEntity: gizmoPlaneEntity,
        pivotEntity: pivotEntity
      })
      setComponent(gizmoControlEntity, TransformGizmoTagComponent)
      setComponent(gizmoControlEntity, VisibleComponent)
      setComponent(gizmoControlEntity, TransformComponent)
      gizmoEntity.set(gizmoControlEntity)

      return () => {
        removeEntity(gizmoControlEntity)
        removeEntity(gizmoVisualEntity)
        removeEntity(gizmoPlaneEntity)
        removeEntity(pivotEntity)
        gizmoEntity.set(UndefinedEntity)
      }
    }, [originEntity])

    useEffect(() => {
      if (!gizmoEntity.value || !controlledEntity) return
      if (!hasComponent(controlledEntity, TransformComponent)) return

      setComponent(gizmoEntity.value, TransformGizmoControlComponent, {
        controlledEntities: controlledEntities
      })
    }, [gizmoEntity, JSON.stringify(controlledEntities)])

    return gizmoEntity.value
  },

  reactor: () => {
    const gizmoControlEntity = useEntityContext()

    InputComponent.useExecuteWithInput(
      () => {
        const gizmoControlComponent = getOptionalComponent(gizmoControlEntity, TransformGizmoControlComponent)
        if (!gizmoControlComponent) return
        const visualComponent = getOptionalComponent(gizmoControlComponent.visualEntity, TransformGizmoVisualComponent)
        if (!visualComponent) return

        const pickerEntity = visualComponent.picker

        const inputSourceEntities = InputComponent.getInputSourceEntities(pickerEntity)
        const pickerButtons = InputComponent.getButtons(pickerEntity)

        onPointerHover(gizmoControlEntity, inputSourceEntities)

        if (pickerButtons?.PrimaryClick?.pressed) {
          const pointerEntity = pickerButtons.PrimaryClick.inputSourceEntity

          if (pickerButtons?.PrimaryClick?.down) {
            onPointerDown(gizmoControlEntity, pointerEntity)
          }

          if (pickerButtons?.PrimaryClick?.dragging) {
            onPointerDrag(gizmoControlEntity, pointerEntity)
          }

          if (pickerButtons?.PrimaryClick?.up) {
            onPointerUp(gizmoControlEntity, pointerEntity)
          }
        }

        transformGizmoUpdate(gizmoControlEntity)
      },
      InputExecutionOrder.Before,
      true
    )

    return null
  }
})
