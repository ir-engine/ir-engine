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
import { Box3, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three'

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
import {
  TransformAxis,
  TransformMode,
  TransformPivot,
  TransformSpace
} from '@ir-engine/engine/src/scene/constants/transformConstants'
import { getState, useHookstate, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
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
} from '../../../functions/gizmos/transformGizmoHelper'
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
    transformPivot: S.LiteralUnion(Object.values(TransformPivot), TransformPivot.Origin),
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

    useEffect(() => {
      if (!originEntity) return

      const controlledEntity = controlledEntities[controlledEntities.length - 1]
      if (!controlledEntity) return

      // we dont want a transform gizmo on non spatial entities, like materials
      if (!hasComponent(controlledEntity, TransformComponent)) return

      const gizmoVisualEntity = createEntity()
      setComponent(gizmoVisualEntity, EntityTreeComponent, { parentEntity: originEntity })
      setComponent(gizmoVisualEntity, NameComponent, 'transformGizmoVisualEntity')
      setComponent(gizmoVisualEntity, TransformGizmoVisualComponent)
      setComponent(gizmoVisualEntity, TransformGizmoTagComponent)
      setComponent(gizmoVisualEntity, VisibleComponent)
      setComponent(gizmoVisualEntity, TransformComponent)
      ObjectLayerMaskComponent.setLayer(gizmoVisualEntity, ObjectLayers.TransformGizmo)

      const gizmoPlaneEntity = createEntity()
      setComponent(gizmoPlaneEntity, EntityTreeComponent, { parentEntity: originEntity })
      setComponent(gizmoPlaneEntity, NameComponent, 'transformGizmoPlaneEntity')
      setComponent(gizmoPlaneEntity, TransformComponent)
      setComponent(gizmoPlaneEntity, InputComponent)
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

      const gizmoControlEntity = createEntity()
      setComponent(gizmoControlEntity, EntityTreeComponent, { parentEntity: originEntity })
      setComponent(gizmoControlEntity, NameComponent, 'transformGizmoControlEntity')
      setComponent(gizmoControlEntity, TransformGizmoControlComponent, {
        controlledEntities: controlledEntities,
        visualEntity: gizmoVisualEntity,
        planeEntity: gizmoPlaneEntity
      })
      setComponent(gizmoControlEntity, TransformGizmoTagComponent)
      setComponent(gizmoControlEntity, VisibleComponent)
      setComponent(gizmoControlEntity, TransformComponent)

      setComponent(controlledEntity, TransformGizmoControlledComponent, { controller: gizmoControlEntity })

      return () => {
        removeEntity(gizmoControlEntity)
        removeEntity(gizmoVisualEntity)
        removeEntity(gizmoPlaneEntity)
      }
    }, [!!originEntity, controlledEntities.join(',')]) // .join is a hack because SelectionState.useSelectedEntities creates a new array each time
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

        const pickerButtons = InputComponent.getMergedButtons(pickerEntity)
        const planeButtons = InputComponent.getMergedButtons(gizmoControlComponent.planeEntity)

        if (
          (pickerButtons?.PrimaryClick?.pressed || planeButtons?.PrimaryClick?.pressed) &&
          getState(InputState).capturingEntity === UndefinedEntity
        ) {
          InputState.setCapturingEntity(pickerEntity)
          onPointerMove(gizmoControlEntity)

          //pointer down
          if (pickerButtons?.PrimaryClick?.down) {
            setComponent(gizmoControlComponent.planeEntity, VisibleComponent)
            onPointerDown(gizmoControlEntity)
          }

          if (planeButtons?.PrimaryClick?.up || pickerButtons?.PrimaryClick?.up) {
            onPointerUp(gizmoControlEntity)
            onPointerLost(gizmoControlEntity)
            removeComponent(gizmoControlComponent.planeEntity, VisibleComponent)
          }
        }
      },
      true,
      InputExecutionOrder.Before
    )

    const pivotEntity = useHookstate(() => {
      const pivotEntity = createEntity()
      setComponent(pivotEntity, NameComponent, 'transformGizmoPivotEntity')
      setComponent(pivotEntity, TransformComponent)
      setComponent(pivotEntity, VisibleComponent)
      setComponent(pivotEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
      setComponent(pivotEntity, TransformGizmoTagComponent)

      /*addObjectToGroup(
        pivotEntity,
        new Mesh(new SphereGeometry(1.5, 32, 32), new MeshBasicMaterial({ color: 0xff0000 }))
      )*/
      // useful for debug so leaving it here
      return pivotEntity
    }).value

    useEffect(() => {
      setComponent(gizmoControlEntity, TransformGizmoControlComponent, { pivotEntity: pivotEntity })

      return () => {
        removeEntity(pivotEntity)
      }
    }, [])

    const controlledEntities = gizmoControlComponent.controlledEntities.value as Entity[]

    useEffect(() => {
      if (controlledEntities.length <= 1) return

      const newPosition = new Vector3()
      TransformComponent.getWorldPosition(pivotEntity, newPosition)

      switch (gizmoControlComponent.transformPivot.value) {
        case TransformPivot.Origin:
          newPosition.setScalar(0)
          break
        case TransformPivot.FirstSelected:
          TransformComponent.getWorldPosition(controlledEntities[0], newPosition)
          break
        case TransformPivot.Center:
          getMidpointWorldPosition(controlledEntities, newPosition)
          break
        case TransformPivot.BoundingBox:
        case TransformPivot.BoundingBoxBottom:
          box.makeEmpty()

          for (let i = 0; i < controlledEntities.length; i++) {
            const parentEnt = controlledEntities[i]
            box.expandByPoint(getComponent(parentEnt, TransformComponent).position)
          }
          box.getCenter(newPosition)

          if (gizmoControlComponent.transformPivot.value === TransformPivot.BoundingBoxBottom) newPosition.y = box.min.y
          break
      }

      setComponent(pivotEntity, TransformComponent, { position: newPosition })
    }, [gizmoControlComponent.transformPivot, controlledEntities])

    return null
  }
})

const getMidpointWorldPosition = (entities: Entity[], outVec3: Vector3) => {
  outVec3.set(0, 0, 0)
  const position = new Vector3()
  for (const entity of entities) {
    TransformComponent.getWorldPosition(entity, position)
    outVec3.add(position)
  }
  outVec3.divideScalar(entities.length)
}

const box = new Box3()
