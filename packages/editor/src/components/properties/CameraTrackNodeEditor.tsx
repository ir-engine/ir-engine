import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { CameraTrackComponent } from '@xrengine/engine/src/scene/components/CameraTrackComponent'
import { SplineComponent } from '@xrengine/engine/src/scene/components/SplineComponent'

import CameraswitchIcon from '@mui/icons-material/Cameraswitch'

import EulerInput from '../inputs/EulerInput'
import InputGroup from '../inputs/InputGroup'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

/**
 * SplineNodeEditor used to create and customize splines in the scene.
 *
 * @param       {Object} props
 * @constructor
 */

export const CameraTrackNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const helper = useComponent(props.node.entity, CameraTrackComponent).helper.value

  return (
    <NodeEditor description={t('editor:properties.spline.description')} {...props}>
      {helper.children.map((point, i) => (
        <InputGroup
          key={point.uuid}
          name="Rotation"
          label={`${t('editor:properties.transform.lbl-position')} ${i + 1}`}
        >
          <EulerInput
            style={{ maxWidth: 'calc(100% - 2px)', paddingRight: `3px`, width: '100%' }}
            quaternion={point.quaternion}
            unit="°"
            onChange={(val) => {
              point.quaternion.setFromEuler(val)
              point.updateMatrixWorld(true)
            }}
          />
        </InputGroup>
      ))}
    </NodeEditor>
  )
}

CameraTrackNodeEditor.iconComponent = CameraswitchIcon

export default CameraTrackNodeEditor
