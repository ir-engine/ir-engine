import React from 'react'
import { useTranslation } from 'react-i18next'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import CameraAltIcon from '@mui/icons-material/CameraAlt'

import { executeModifyPropertyCommand } from '../../classes/History'
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
    executeModifyPropertyCommand({
      affectedNodes: [props.node],
      component: TransformComponent,
      properties: [{ position: position.clone(), rotation: rotation.clone() }]
    })
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
