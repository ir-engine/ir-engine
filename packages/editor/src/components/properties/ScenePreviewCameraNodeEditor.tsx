import React from 'react'
import NodeEditor from './NodeEditor'
import { PropertiesPanelButton } from '../inputs/Button'
import { useTranslation } from 'react-i18next'
import CameraAltIcon from '@mui/icons-material/CameraAlt'

/**
 * ScenePreviewCameraNodeEditorProps declaring props for ScenePreviewCameraNodeEditor.
 *
 * @author Robert Long
 * @type {Object}
 */
type ScenePreviewCameraNodeEditorProps = {
  node?: object
}

/**
 * ScenePreviewCameraNodeEditor provides the editor view to customize properties.
 *
 * @author Robert Long
 * @type {Class component}
 */
export const ScenePreviewCameraNodeEditor = (props: ScenePreviewCameraNodeEditorProps) => {
  const { t } = useTranslation()

  const onSetFromViewport = () => {
    props.node.setFromViewport()
  }

  return (
    <NodeEditor {...props} description={t('editor:properties.sceneCamera.description')}>
      <PropertiesPanelButton onClick={onSetFromViewport}>
        {t('editor:properties.sceneCamera.lbl-setFromViewPort')}
      </PropertiesPanelButton>
    </NodeEditor>
  )
}

ScenePreviewCameraNodeEditor.iconComponent = CameraAltIcon

export default ScenePreviewCameraNodeEditor
