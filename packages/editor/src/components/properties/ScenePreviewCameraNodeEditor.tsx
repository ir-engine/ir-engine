import React from 'react'
import { useTranslation } from 'react-i18next'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import {
  LocalTransformComponent,
  TransformComponent
} from '@etherealengine/engine/src/transform/components/TransformComponent'

import CameraAltIcon from '@mui/icons-material/CameraAlt'

import { PropertiesPanelButton } from '../inputs/Button'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

/**
 * ScenePreviewCameraNodeEditor provides the editor view to customize properties.
 *
 * @type {Class component}
 */
export const ScenePreviewCameraNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const onSetFromViewport = () => {
    const { position, rotation } = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent)
    const transform = getComponent(props.entity, LocalTransformComponent)
    transform.position.copy(position)
    transform.rotation.copy(rotation)
    LocalTransformComponent.stateMap[props.entity]!.set(LocalTransformComponent.valueMap[props.entity])
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.sceneCamera.name')}
      description={t('editor:properties.sceneCamera.description')}
    >
      <PropertiesPanelButton onClick={onSetFromViewport}>
        {t('editor:properties.sceneCamera.lbl-setFromViewPort')}
      </PropertiesPanelButton>
    </NodeEditor>
  )
}

ScenePreviewCameraNodeEditor.iconComponent = CameraAltIcon

export default ScenePreviewCameraNodeEditor
