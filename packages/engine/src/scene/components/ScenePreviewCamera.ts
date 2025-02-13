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

import { useEffect, useLayoutEffect } from 'react'
import { CameraHelper, PerspectiveCamera } from 'three'

import { EngineState, useEntityContext, useExecute } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getMutableState, getState, isClient, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { ActiveHelperComponent } from '@ir-engine/spatial/src/common/ActiveHelperComponent'
import { useHelperEntity } from '@ir-engine/spatial/src/common/debug/useHelperEntity'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { TransformDirtyCleanupSystem } from '@ir-engine/spatial/src/transform/systems/TransformSystem'

export const ScenePreviewCameraComponent = defineComponent({
  name: 'EE_scenePreviewCamera',
  jsonID: 'EE_scene_preview_camera',

  schema: S.Object({
    camera: S.NonSerialized(S.Class(() => new PerspectiveCamera(80, 16 / 9, 0.2, 8000)))
  }),

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()
    const renderState = useMutableState(RendererState)
    const activeHelperComponent = useOptionalComponent(entity, ActiveHelperComponent)
    const debugEnabled =
      renderState.nodeHelperVisibility || (activeHelperComponent !== undefined && activeHelperComponent.enabled.value)
    const previewCamera = useComponent(entity, ScenePreviewCameraComponent)
    const previewCameraTransform = useComponent(entity, TransformComponent)
    const engineCameraTransform = useOptionalComponent(getState(ReferenceSpaceState).viewerEntity, TransformComponent)
    const isEditing = useHookstate(getMutableState(EngineState).isEditing).value

    useLayoutEffect(() => {
      if (!engineCameraTransform || isEditing) return

      const transform = getComponent(entity, TransformComponent)
      const cameraTransform = getComponent(getState(ReferenceSpaceState).viewerEntity, TransformComponent)
      cameraTransform.position.copy(transform.position)
      cameraTransform.rotation.copy(transform.rotation)
      const camera = previewCamera.camera.value as PerspectiveCamera
      setComponent(entity, ObjectComponent, camera)
      setComponent(entity, ActiveHelperComponent, { directional: true })

      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [engineCameraTransform])

    useExecute(
      () => {
        if (!TransformComponent.dirty[entity]) return
        const camera = getComponent(entity, ScenePreviewCameraComponent).camera
        camera.matrixWorldInverse.copy(camera.matrixWorld).invert()
      },
      { before: TransformDirtyCleanupSystem }
    )

    useLayoutEffect(() => {
      if (!engineCameraTransform) return
      previewCamera.camera.value.position.copy(previewCameraTransform.position.value)
      previewCamera.camera.value.quaternion.copy(previewCameraTransform.rotation.value)
    }, [previewCameraTransform])

    const helperEntity = useHelperEntity(
      entity,
      () => new CameraHelper(previewCamera.camera.value as PerspectiveCamera),
      debugEnabled.value
    )

    useEffect(() => {
      activeHelperComponent?.helperSelectedGizmo.set(helperEntity)
    }, [helperEntity])
    return null
  }
})
