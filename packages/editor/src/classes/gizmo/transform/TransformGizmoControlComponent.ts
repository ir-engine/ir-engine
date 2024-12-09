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
import { MathUtils } from 'three'

import {
  defineComponent,
  Engine,
  getComponent,
  removeComponent,
  setComponent,
  UndefinedEntity,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import {
  SnapMode,
  TransformAxis,
  TransformMode,
  TransformSpace
} from '@ir-engine/engine/src/scene/constants/transformConstants'
import { getState, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import { InputComponent, InputExecutionOrder } from '@ir-engine/spatial/src/input/components/InputComponent'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { TransformGizmoTagComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { gizmoPlane } from '../../../constants/GizmoPresets'
import {
  onGizmoCommit,
  onPointerDown,
  onPointerHover,
  onPointerLost,
  onPointerMove,
  onPointerUp
} from '../../../functions/transformGizmoHelper'
import { EditorHelperState } from '../../../services/EditorHelperState'
import { TransformGizmoVisualComponent } from './TransformGizmoVisualComponent'

export const TransformGizmoControlComponent = defineComponent({
  name: 'TransformGizmoControl',

  schema: S.Object({
    controlledEntities: S.Array(T.Entity(), []),
    visualEntity: T.Entity(),
    planeEntity: T.Entity(),
    pivotEntity: T.Entity(),
    enabled: S.Bool(true),
    dragging: S.Bool(false),
    axis: S.Nullable(S.LiteralUnion(Object.values(TransformAxis)), null),
    space: S.LiteralUnion(Object.values(TransformSpace), TransformSpace.world),
    mode: S.LiteralUnion(Object.values(TransformMode), TransformMode.translate),
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

  reactor: function (props) {
    const gizmoControlEntity = useEntityContext()
    const gizmoControlComponent = useComponent(gizmoControlEntity, TransformGizmoControlComponent)
    getComponent(Engine.instance.viewerEntity, RendererComponent).renderer!.domElement.style.touchAction = 'none' // disable touch scroll , hmm the editor window isnt scrollable anyways
    const editorHelperState = useMutableState(EditorHelperState)
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
        const pickerEntity = visualComponent.picker[gizmoControlComponent.mode]

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

    useEffect(() => {
      addObjectToGroup(gizmoControlComponent.planeEntity.value, gizmoPlane)
      gizmoPlane.layers.set(ObjectLayers.TransformGizmo)
      setComponent(gizmoControlComponent.planeEntity.value, InputComponent)
      setComponent(gizmoControlComponent.planeEntity.value, TransformGizmoTagComponent)
    }, [])

    useEffect(() => {
      const mode = editorHelperState.transformMode.value
      gizmoControlComponent.mode.set(mode)
    }, [editorHelperState.transformMode])

    useEffect(() => {
      const space = editorHelperState.transformSpace.value
      gizmoControlComponent.space.set(space)
    }, [editorHelperState.transformSpace])

    useEffect(() => {
      switch (editorHelperState.gridSnap.value) {
        case SnapMode.Disabled: // continous update
          gizmoControlComponent.translationSnap.set(0)
          gizmoControlComponent.rotationSnap.set(0)
          gizmoControlComponent.scaleSnap.set(0)
          break
        case SnapMode.Grid:
          gizmoControlComponent.translationSnap.set(editorHelperState.translationSnap.value)
          gizmoControlComponent.rotationSnap.set(MathUtils.degToRad(editorHelperState.rotationSnap.value))
          gizmoControlComponent.scaleSnap.set(editorHelperState.scaleSnap.value)
          break
      }
    }, [editorHelperState.gridSnap])

    useEffect(() => {
      gizmoControlComponent.translationSnap.set(
        editorHelperState.gridSnap.value === SnapMode.Grid ? editorHelperState.translationSnap.value : 0
      )
    }, [editorHelperState.translationSnap])

    useEffect(() => {
      gizmoControlComponent.rotationSnap.set(
        editorHelperState.gridSnap.value === SnapMode.Grid
          ? MathUtils.degToRad(editorHelperState.rotationSnap.value)
          : 0
      )
    }, [editorHelperState.rotationSnap])

    useEffect(() => {
      gizmoControlComponent.scaleSnap.set(
        editorHelperState.gridSnap.value === SnapMode.Grid ? editorHelperState.scaleSnap.value : 0
      )
    }, [editorHelperState.scaleSnap])

    return null
  }
})
