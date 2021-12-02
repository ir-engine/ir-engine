import React from 'react'
import NodeEditor from './NodeEditor'
import { Camera } from '@styled-icons/fa-solid/Camera'
import { PropertiesPanelButton } from '../inputs/Button'
import { useTranslation } from 'react-i18next'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ScenePreviewCameraTagComponent } from '@xrengine/engine/src/scene/components/ScenePreviewCamera'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'

/**
 * ScenePreviewCameraNodeEditorProps declaring props for ScenePreviewCameraNodeEditor.
 *
 * @author Robert Long
 * @type {Object}
 */
type ScenePreviewCameraNodeEditorProps = {
  node: EntityTreeNode
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
    const component = getComponent(props.node.entity, ScenePreviewCameraTagComponent)
    component.update = true
  }

  return (
    <NodeEditor {...props} description={t('editor:properties.sceneCamera.description')}>
      <PropertiesPanelButton onClick={onSetFromViewport}>
        {t('editor:properties.sceneCamera.lbl-setFromViewPort')}
      </PropertiesPanelButton>
    </NodeEditor>
  )
}

ScenePreviewCameraNodeEditor.iconComponent = Camera

export default ScenePreviewCameraNodeEditor
