import React from 'react'
import NodeEditor from './NodeEditor'
import { PropertiesPanelButton } from '../inputs/Button'
import { useTranslation } from 'react-i18next'
import { updateScenePreviewCamera } from '@xrengine/engine/src/scene/functions/loaders/ScenePreviewCameraFunctions'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import { EditorComponentType } from './Util'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { CommandManager } from '../../managers/CommandManager'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'

/**
 * ScenePreviewCameraNodeEditor provides the editor view to customize properties.
 *
 * @author Robert Long
 * @type {Class component}
 */
export const ScenePreviewCameraNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const onSetFromViewport = () => {
    const obj3d = getComponent(props.node.entity, Object3DComponent).value
    CommandManager.instance.setProperty([props.node], {
      component: NameComponent,
      properties: { position: obj3d.position, rotation: obj3d.rotation }
    })
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
