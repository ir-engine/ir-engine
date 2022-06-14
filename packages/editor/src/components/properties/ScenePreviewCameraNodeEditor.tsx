import React from 'react'
import { useTranslation } from 'react-i18next'
import { Quaternion, Vector3 } from 'three'

import { updateCameraTransform } from '@xrengine/engine/src/scene/functions/loaders/ScenePreviewCameraFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import CameraAltIcon from '@mui/icons-material/CameraAlt'

import { executeModifyPropertyCommand } from '../../classes/History'
import { PropertiesPanelButton } from '../inputs/Button'
import NodeEditor from './NodeEditor'
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
    const updatedTransform = updateCameraTransform(props.node.entity)
    const position = new Vector3()
    const rotation = new Quaternion()
    const scale = new Vector3()

    updatedTransform.decompose(position, rotation, scale)
    executeModifyPropertyCommand({
      affectedNodes: [props.node],
      component: TransformComponent,
      properties: [{ position, rotation }]
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
