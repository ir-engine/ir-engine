import React, { Component } from 'react'
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
export class ScenePreviewCameraNodeEditor extends Component<ScenePreviewCameraNodeEditorProps, {}> {
  // setting iconComponent as icon name
  static iconComponent = Camera

  // setting description for ScenePreviewCameraNode and will appear on editor view
  static description = i18n.t('editor:properties.sceneCamera.description')
  onSetFromViewport = () => {
    ;(this.props.node as any).setFromViewport()
  }
  render() {
    ScenePreviewCameraNodeEditor.description = this.props.t('editor:properties.sceneCamera.description')
    return (
      <NodeEditor {...this.props} description={ScenePreviewCameraNodeEditor.description}>
        <PropertiesPanelButton onClick={this.onSetFromViewport}>
          {this.props.t('editor:properties.sceneCamera.lbl-setFromViewPort')}
        </PropertiesPanelButton>
      </NodeEditor>
    )
  }
}

export default withTranslation()(ScenePreviewCameraNodeEditor)
