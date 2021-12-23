import React from 'react'
import NodeEditor from './NodeEditor'
import { PropertiesPanelButton } from '../inputs/Button'
import { useTranslation } from 'react-i18next'
import { updateScenePreviewCamera } from '@xrengine/engine/src/scene/functions/loaders/ScenePreviewCameraFunctions'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import { EditorComponentType } from './Util'

/**
 * ScenePreviewCameraNodeEditor provides the editor view to customize properties.
 *
 * @author Robert Long
 * @type {Class component}
 */
export const ScenePreviewCameraNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const onSetFromViewport = () => {
    updateScenePreviewCamera(props.node.entity)
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
