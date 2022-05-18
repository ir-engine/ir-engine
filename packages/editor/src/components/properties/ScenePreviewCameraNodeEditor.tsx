import React from 'react'
import NodeEditor from './NodeEditor'
import { Vector3, Quaternion } from 'three'
import { PropertiesPanelButton } from '../inputs/Button'
import { useTranslation } from 'react-i18next'
import { updateCameraTransform } from '@xrengine/engine/src/scene/functions/loaders/ScenePreviewCameraFunctions'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import { EditorComponentType } from './Util'
import { CommandManager } from '../../managers/CommandManager'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

/**
 * ScenePreviewCameraNodeEditor provides the editor view to customize properties.
 *
 * @author Robert Long
 * @type {Class component}
 */
export const ScenePreviewCameraNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const onSetFromViewport = () => {
    const updatedTransform = updateCameraTransform(props.node.entity)
    const position = new Vector3()
    const rotation = new Quaternion()
    const scale = new Vector3()

    updatedTransform.decompose(position, rotation, scale)
    CommandManager.instance.setProperty([props.node], {
      component: TransformComponent,
      properties: { position, rotation }
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
