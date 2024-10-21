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
  defineComponent,
  getComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'

import { UndefinedEntity } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { TransformAxis } from '@ir-engine/engine/src/scene/constants/transformConstants'
import { getState, useImmediateEffect } from '@ir-engine/hyperflux'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { CameraGizmoTagComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { InputComponent, InputExecutionOrder } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import {
  onGizmoCommit,
  onPointerDown,
  onPointerHover,
  onPointerLost,
  onPointerUp
} from '../../../functions/cameraGizmoHelper'
import { CameraGizmoVisualComponent } from './CameraGizmoVisualComponent'

// camera synced to the visual entity
export const CameraGizmoComponent = defineComponent({
  name: 'CameraGizmo',

  schema: S.Object({
    sceneEntity: S.Entity(),
    cameraEntity: S.Entity(),
    visualEntity: S.Entity(),
    enabled: S.Bool(true),
    axis: S.Nullable(S.LiteralUnion(Object.values(TransformAxis)), null),
    showX: S.Bool(true),
    showY: S.Bool(true),
    showZ: S.Bool(true)
  }),

  reactor: function (props) {
    const entity = useEntityContext()
    const cameraGizmoComponent = useComponent(entity, CameraGizmoComponent)
    const inputPointerEntities = InputPointerComponent.usePointersForCamera(cameraGizmoComponent.cameraEntity.value)

    useEffect(() => {
      const gizmoVisualEntity = createEntity()
      setComponent(gizmoVisualEntity, EntityTreeComponent, {
        parentEntity: cameraGizmoComponent.sceneEntity.value ?? getState(EngineState).originEntity
      })

      setComponent(entity, NameComponent, 'cameraGizmoEntity')
      setComponent(entity, CameraGizmoTagComponent)
      setComponent(entity, VisibleComponent)

      setComponent(gizmoVisualEntity, NameComponent, 'cameraGizmoVisualEntity')
      setComponent(gizmoVisualEntity, CameraGizmoVisualComponent, {
        sceneEntity: cameraGizmoComponent.sceneEntity.value
      })
      setComponent(gizmoVisualEntity, CameraGizmoTagComponent)
      setComponent(gizmoVisualEntity, VisibleComponent)
      cameraGizmoComponent.visualEntity.set(gizmoVisualEntity)
      return () => {
        removeComponent(gizmoVisualEntity, CameraGizmoVisualComponent)
        removeEntity(gizmoVisualEntity)
        cameraGizmoComponent.visualEntity.set(UndefinedEntity)
      }
    }, [])

    useImmediateEffect(() => {
      if (
        !cameraGizmoComponent.enabled.value ||
        !cameraGizmoComponent.visualEntity.value ||
        inputPointerEntities.length
      )
        return

      onGizmoCommit(entity)
    }, [inputPointerEntities])

    InputComponent.useExecuteWithInput(
      () => {
        if (!cameraGizmoComponent.enabled.value || !cameraGizmoComponent.visualEntity.value) return
        if (!cameraGizmoComponent.cameraEntity.value || !getState(EngineState).viewerEntity) return

        onPointerHover(entity)

        const pickerButtons = InputComponent.getMergedButtons(
          getComponent(cameraGizmoComponent.visualEntity.value, CameraGizmoVisualComponent).picker
        )

        //pointer down
        if (pickerButtons?.PrimaryClick?.down) {
          onPointerDown(entity)
        }

        if (pickerButtons?.PrimaryClick?.up) {
          onPointerUp(entity)
          onPointerLost(entity)
        }
      },
      true,
      InputExecutionOrder.Before
    )

    return null
  }
})
