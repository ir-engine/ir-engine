import React from 'react'
import NodeEditor from './NodeEditor'
import * as THREE from 'three'
import { PropertiesPanelButton } from '../inputs/Button'
import { useTranslation } from 'react-i18next'
import { updateCameraTransform } from '@xrengine/engine/src/scene/functions/loaders/ScenePreviewCameraFunctions'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import { EditorComponentType } from './Util'
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
    const updatedTransform = updateCameraTransform(props.node.entity)
    const position = new THREE.Vector3()
    const rotation = new THREE.Quaternion()
    const scale = new THREE.Vector3()

    updatedTransform.decompose(position, rotation, scale)
    CommandManager.instance.setProperty([props.node], {
      component: NameComponent,
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
