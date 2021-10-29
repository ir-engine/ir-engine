import React, { useEffect } from 'react'
import NodeEditor from './NodeEditor'
import { Camera } from '@styled-icons/fa-solid/Camera'
import { PropertiesPanelButton } from '../inputs/Button'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ScenePreviewCameraTagComponent } from '@xrengine/engine/src/scene/components/ScenePreviewCameraComponent'
import { CommandManager } from '../../managers/CommandManager'
import EditorEvents from '../../constants/EditorEvents'
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
export const ScenePreviewCameraNodeEditor = (props: ScenePreviewCameraNodeEditorProps) => {
  useEffect(() => {
    const component = getComponent(props.node.eid, ScenePreviewCameraTagComponent)
    SceneManager.instance.scene.add(component.helper)
  }, [])

  useEffect(() => {
    const component = getComponent(props.node.eid, ScenePreviewCameraTagComponent)
    SceneManager.instance.scene.remove(component.helper)
  }, null)

  const onSetFromViewport = () => {
    const component = getComponent(props.node.eid, ScenePreviewCameraTagComponent)
    component.setFromViewport()
    CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED)
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
