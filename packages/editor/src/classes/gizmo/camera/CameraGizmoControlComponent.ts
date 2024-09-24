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

import { defineComponent, Engine, getComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { TransformAxis } from '@ir-engine/engine/src/scene/constants/transformConstants'
import { useImmediateEffect } from '@ir-engine/hyperflux'
import { InputComponent, InputExecutionOrder } from '@ir-engine/spatial/src/input/components/InputComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import {
  onGizmoCommit,
  onPointerDown,
  onPointerHover,
  onPointerLost,
  onPointerUp
} from '../../../functions/cameraGizmoHelper'
import { CameraGizmoVisualComponent } from './CameraGizmoVisualComponent'
// handles operations on the camera gizmo
export const CameraGizmoControlComponent = defineComponent({
  name: 'CameraGizmoControl',

  schema: S.Object({
    controlledCameras: S.Array(S.Entity(), []),
    visualEntity: S.Entity(),
    enabled: S.Bool(true),
    axis: S.Nullable(S.LiteralUnion(Object.values(TransformAxis)), null),
    showX: S.Bool(true),
    showY: S.Bool(true),
    showZ: S.Bool(true)
  }),

  reactor: function (props) {
    const gizmoControlEntity = useEntityContext()
    const gizmoControlComponent = useComponent(gizmoControlEntity, CameraGizmoControlComponent)
    getComponent(Engine.instance.viewerEntity, RendererComponent).renderer!.domElement.style.touchAction = 'none' // disable touch scroll , hmm the editor window isnt scrollable anyways
    const inputPointerEntities = InputPointerComponent.usePointersForCamera(Engine.instance.viewerEntity)

    // Commit transform changes if the pointer entities are lost (ie. pointer dragged outside of the canvas)
    useImmediateEffect(() => {
      const gizmoControlComponent = getComponent(gizmoControlEntity, CameraGizmoControlComponent)
      if (!gizmoControlComponent.enabled || !gizmoControlComponent.visualEntity || inputPointerEntities.length) return

      onGizmoCommit(gizmoControlEntity)
    }, [inputPointerEntities])

    InputComponent.useExecuteWithInput(
      () => {
        const gizmoControlComponent = getComponent(gizmoControlEntity, CameraGizmoControlComponent)

        if (!gizmoControlComponent.enabled || !gizmoControlComponent.visualEntity) return

        const visualComponent = getComponent(gizmoControlComponent.visualEntity, CameraGizmoVisualComponent)
        const pickerEntity = visualComponent.picker
        onPointerHover(gizmoControlEntity)

        const pickerButtons = InputComponent.getMergedButtons(pickerEntity)

        //pointer down
        if (pickerButtons?.PrimaryClick?.down) {
          onPointerDown(gizmoControlEntity)
        }

        if (pickerButtons?.PrimaryClick?.up) {
          onPointerUp(gizmoControlEntity)
          onPointerLost(gizmoControlEntity)
        }
      },
      true,
      InputExecutionOrder.Before
    )

    return null
  }
})
