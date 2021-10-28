import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import { Camera } from '@styled-icons/fa-solid/Camera'
import { PropertiesPanelButton } from '../inputs/Button'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ScenePreviewCameraTagComponent } from '@xrengine/engine/src/scene/components/ScenePreviewCameraComponent'
import { CommandManager } from '../../managers/CommandManager'
import EditorEvents from '../../constants/EditorEvents'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { SceneManager } from '../../managers/SceneManager'

/**
 * ScenePreviewCameraNodeEditorProps declaring props for ScenePreviewCameraNodeEditor.
 *
 * @author Robert Long
 * @type {Object}
 */
type ScenePreviewCameraNodeEditorProps = {
  node?: any
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

  componentDidMount() {
    const component = getComponent(this.props.node.eid, ScenePreviewCameraTagComponent)
    SceneManager.instance.scene.add(component.helper)
  }

  componentWillUnmount() {
    const component = getComponent(this.props.node.eid, ScenePreviewCameraTagComponent)
    SceneManager.instance.scene.remove(component.helper)
  }

  onSetFromViewport = () => {
    const component = getComponent(this.props.node.eid, ScenePreviewCameraTagComponent)
    component.setFromViewport()
    CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED)
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
