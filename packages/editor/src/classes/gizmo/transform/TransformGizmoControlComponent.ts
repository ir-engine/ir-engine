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
import { Box3, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'

import {
  createEntity,
  defineComponent,
  Engine,
  Entity,
  EntityTreeComponent,
  getComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { getState, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import {
  TransformAxis,
  TransformMode,
  TransformPivot,
  TransformSpace
} from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { useTransformPivot } from '@ir-engine/spatial/src/common/functions/useTransformPivot'
import { InputComponent, InputExecutionOrder } from '@ir-engine/spatial/src/input/components/InputComponent'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { TransformGizmoTagComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import {
  onGizmoCommit,
  onPointerDown,
  onPointerHover,
  onPointerLost,
  onPointerMove,
  onPointerUp
} from '../../../functions/transformGizmoHelper'
import { TransformGizmoControlledComponent } from './TransformGizmoControlledComponent'
import { TransformGizmoVisualComponent } from './TransformGizmoVisualComponent'

export const TransformGizmoControlComponent = defineComponent({
  name: 'TransformGizmoControlComponent',

  schema: S.Object({
    controlledEntities: S.Array(S.Entity(), []),
    visualEntity: S.Entity(),
    planeEntity: S.Entity(),
    pivotEntity: S.Entity(),
    enabled: S.Bool(true),
    dragging: S.Bool(false),
    axis: S.Nullable(S.LiteralUnion(Object.values(TransformAxis)), null),
    space: S.LiteralUnion(Object.values(TransformSpace), TransformSpace.world),
    mode: S.LiteralUnion(Object.values(TransformMode), TransformMode.translate),
    transformPivot: S.LiteralUnion(Object.values(TransformPivot), TransformPivot.FirstSelected),
    translationSnap: S.Nullable(S.Number(), null),
    rotationSnap: S.Nullable(S.Number(), null),
    scaleSnap: S.Nullable(S.Number(), null),
    size: S.Number(1),
    showX: S.Bool(true),
    showY: S.Bool(true),
    showZ: S.Bool(true),
    worldPosition: T.Vec3(),
    worldPositionStart: T.Vec3(),
    worldQuaternion: T.Quaternion(),
    worldQuaternionStart: T.Quaternion(),
    pointStart: T.Vec3(),
    pointEnd: T.Vec3(),
    rotationAxis: T.Vec3(),
    rotationAngle: S.Number(0),
    eye: T.Vec3()
  }),

  useControlEntities: (controlledEntities: Entity[]) => {
    const originEntity = useMutableState(ReferenceSpaceState).originEntity.value
    const controlledEntity = controlledEntities[0]

    useEffect(() => {
      if (!originEntity) return
      if (!controlledEntity) return

      // we dont want a transform gizmo on non spatial entities, like materials
      if (!hasComponent(controlledEntity, TransformComponent)) return

      const gizmoVisualEntity = createEntity()
      setComponent(gizmoVisualEntity, EntityTreeComponent, { parentEntity: originEntity })
      setComponent(gizmoVisualEntity, NameComponent, 'gizmoVisualEntity')
      setComponent(gizmoVisualEntity, TransformGizmoVisualComponent)
      setComponent(gizmoVisualEntity, TransformGizmoTagComponent)
      setComponent(gizmoVisualEntity, VisibleComponent)
      setComponent(gizmoVisualEntity, TransformComponent)
      setComponent(gizmoVisualEntity, InputComponent)
      ObjectLayerMaskComponent.setLayer(gizmoVisualEntity, ObjectLayers.TransformGizmo)

      const gizmoPlaneEntity = createEntity()
      setComponent(gizmoPlaneEntity, EntityTreeComponent, { parentEntity: originEntity })
      setComponent(gizmoPlaneEntity, NameComponent, 'gizmoPlaneEntity')
      setComponent(gizmoPlaneEntity, TransformComponent)
      setComponent(gizmoPlaneEntity, VisibleComponent)

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

      setComponent(gizmoPlaneEntity, MeshComponent, gizmoPlane)
      setComponent(gizmoPlaneEntity, TransformGizmoTagComponent)
      ObjectLayerMaskComponent.setLayer(gizmoPlaneEntity, ObjectLayers.TransformGizmo)

      const pivotEntity = createEntity()
      setComponent(pivotEntity, NameComponent, 'gizmoPivotEntity')
      setComponent(pivotEntity, TransformComponent)
      setComponent(pivotEntity, VisibleComponent)
      setComponent(pivotEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
      setComponent(pivotEntity, TransformGizmoTagComponent)

      const gizmoControlEntity = createEntity()
      setComponent(gizmoControlEntity, EntityTreeComponent, { parentEntity: originEntity })
      setComponent(gizmoControlEntity, NameComponent, 'gizmoControlEntity')
      setComponent(gizmoControlEntity, TransformGizmoControlComponent, {
        controlledEntities: controlledEntities,
        visualEntity: gizmoVisualEntity,
        planeEntity: gizmoPlaneEntity,
        pivotEntity: pivotEntity
      })
      setComponent(gizmoControlEntity, TransformGizmoTagComponent)
      setComponent(gizmoControlEntity, VisibleComponent)
      setComponent(gizmoControlEntity, TransformComponent)

      setComponent(controlledEntity, TransformGizmoControlledComponent, { controller: gizmoControlEntity })

      return () => {
        removeEntity(gizmoControlEntity)
        removeEntity(gizmoVisualEntity)
        removeEntity(gizmoPlaneEntity)
        removeEntity(pivotEntity)
      }
    }, [originEntity, controlledEntity])
  },

  reactor: () => {
    const gizmoControlEntity = useEntityContext()
    const gizmoControlComponent = useComponent(gizmoControlEntity, TransformGizmoControlComponent)
    const inputPointerEntities = InputPointerComponent.usePointersForCamera(Engine.instance.viewerEntity)

    // Commit transform changes if the pointer entities are lost (ie. pointer dragged outside of the canvas)
    useImmediateEffect(() => {
      const gizmoControlComponent = getComponent(gizmoControlEntity, TransformGizmoControlComponent)
      if (
        !gizmoControlComponent.enabled ||
        !gizmoControlComponent.visualEntity ||
        !gizmoControlComponent.planeEntity ||
        !gizmoControlComponent.dragging ||
        inputPointerEntities.length
      )
        return

      onGizmoCommit(gizmoControlEntity)
      removeComponent(gizmoControlComponent.planeEntity, VisibleComponent)
    }, [inputPointerEntities])

    InputComponent.useExecuteWithInput(
      () => {
        const gizmoControlComponent = getComponent(gizmoControlEntity, TransformGizmoControlComponent)

        if (!gizmoControlComponent.enabled || !gizmoControlComponent.visualEntity || !gizmoControlComponent.planeEntity)
          return

        const visualComponent = getComponent(gizmoControlComponent.visualEntity, TransformGizmoVisualComponent)
        const pickerEntity = visualComponent.picker

        onPointerHover(gizmoControlEntity)

        const pickerButtons = InputComponent.getButtons(pickerEntity)

        if (pickerButtons?.PrimaryClick?.pressed && getState(InputState).capturingEntity === UndefinedEntity) {
          InputState.setCapturingEntity(pickerEntity)
          onPointerMove(gizmoControlEntity)

          //pointer down
          if (pickerButtons?.PrimaryClick?.down) {
            setComponent(gizmoControlComponent.planeEntity, VisibleComponent)
            onPointerDown(gizmoControlEntity)
          }

          if (pickerButtons?.PrimaryClick?.up) {
            onPointerUp(gizmoControlEntity)
            onPointerLost(gizmoControlEntity)
            removeComponent(gizmoControlComponent.planeEntity, VisibleComponent)
          }
        }
      },
      true,
      InputExecutionOrder.Before
    )

    const controlledEntities = gizmoControlComponent.controlledEntities.value as Entity[]

    const pivot = useTransformPivot(controlledEntities, gizmoControlComponent.transformPivot.value)

    useImmediateEffect(() => {
      setComponent(gizmoControlComponent.pivotEntity.value, TransformComponent, { position: pivot.position })
    }, [pivot])

    return null
  }
})

const box = new Box3()
