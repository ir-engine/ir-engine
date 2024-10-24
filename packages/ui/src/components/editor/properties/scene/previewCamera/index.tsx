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

import { debounce } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineCamera } from 'react-icons/hi'

import { getComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { previewScreenshot } from '@ir-engine/editor/src/functions/takeScreenshot'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { ScenePreviewCameraComponent } from '@ir-engine/engine/src/scene/components/ScenePreviewCamera'
import { getState } from '@ir-engine/hyperflux'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import {
  RendererComponent,
  getNestedVisibleChildren,
  getSceneParameters
} from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { computeTransformMatrix } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { ImageLink } from '@ir-engine/ui/editor'
import { Scene } from 'three'
import Button from '../../../../../primitives/tailwind/Button'

/**
 * ScenePreviewCameraNodeEditor provides the editor view to customize properties.
 */

const scene = new Scene()

export const ScenePreviewCameraNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const [bufferUrl, setBufferUrl] = useState<string>('')
  const transformComponent = useComponent(Engine.instance.cameraEntity, TransformComponent)

  const onSetFromViewport = () => {
    const { position, rotation } = getComponent(Engine.instance.cameraEntity, TransformComponent)
    const transform = getComponent(props.entity, TransformComponent)
    transform.position.copy(position)
    transform.rotation.copy(rotation)
    computeTransformMatrix(props.entity)

    EditorControlFunctions.commitTransformSave([props.entity])
  }

  const updateScenePreview = async () => {
    const rootEntity = getState(EngineState).viewerEntity
    const entitiesToRender = getComponent(rootEntity, RendererComponent).scenes.map(getNestedVisibleChildren).flat()
    const { background, environment, fog, children } = getSceneParameters(entitiesToRender)

    scene.children = children
    scene.environment = environment
    scene.fog = fog
    scene.background = background

    const imageBlob = (await previewScreenshot(
      512 / 2,
      320 / 2,
      0.9,
      'jpeg',
      scene,
      getComponent(props.entity, ScenePreviewCameraComponent).camera
    ))!
    const url = URL.createObjectURL(imageBlob)
    setBufferUrl(url)
  }

  const updateCubeMapBakeDebounced = useCallback(debounce(updateScenePreview, 500), []) //ms

  useEffect(() => {
    updateCubeMapBakeDebounced()
    return () => {
      updateCubeMapBakeDebounced.cancel()
    }
  }, [transformComponent.position])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.sceneCamera.name')}
      description={t('editor:properties.sceneCamera.description')}
      Icon={ScenePreviewCameraNodeEditor.iconComponent}
    >
      <ImageLink src={bufferUrl} />
      <div className="flex h-auto flex-col items-center">
        <Button
          onClick={() => {
            onSetFromViewport()
            updateScenePreview()
          }}
        >
          {t('editor:properties.sceneCamera.lbl-setFromViewPort')}
        </Button>
      </div>
    </NodeEditor>
  )
}

ScenePreviewCameraNodeEditor.iconComponent = HiOutlineCamera

export default ScenePreviewCameraNodeEditor
