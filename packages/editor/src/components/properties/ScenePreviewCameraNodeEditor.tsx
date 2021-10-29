import React, { useEffect } from 'react'
import NodeEditor from './NodeEditor'
import { Camera } from '@styled-icons/fa-solid/Camera'
import { PropertiesPanelButton } from '../inputs/Button'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'

/**
 * ScenePreviewCameraNodeEditorProps declaring props for ScenePreviewCameraNodeEditor.
 *
 * @author Robert Long
 * @type {Object}
 */
type ScenePreviewCameraNodeEditorProps = {
  node?: object
  t: Function
}

/**
 * ScenePreviewCameraNodeEditor provides the editor view to customize properties.
 *
 * @author Robert Long
 * @type {Class component}
 */
export const ScenePreviewCameraNodeEditor = (props: ScenePreviewCameraNodeEditorProps) => {
  const onSetFromViewport = () => {
    props.node.setFromViewport()
  }

  return (
    <NodeEditor {...props} description={ScenePreviewCameraNodeEditor.description}>
      <PropertiesPanelButton onClick={onSetFromViewport}>
        {props.t('editor:properties.sceneCamera.lbl-setFromViewPort')}
      </PropertiesPanelButton>
    </NodeEditor>
  )
}

ScenePreviewCameraNodeEditor.iconComponent = Camera
ScenePreviewCameraNodeEditor.description = i18n.t('editor:properties.sceneCamera.description')

export default withTranslation()(ScenePreviewCameraNodeEditor)
