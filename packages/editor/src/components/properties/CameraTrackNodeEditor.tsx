/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { CameraTrackComponent } from '@etherealengine/engine/src/scene/components/CameraTrackComponent'

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
  const helper = useComponent(props.entity, CameraTrackComponent).helper.value

  return (
    <NodeEditor description={t('editor:properties.spline.description')} {...props}>
      {helper.children.map((point, i) => (
        <InputGroup
          key={point.uuid}
          name="Rotation"
          label={`${t('editor:properties.transform.lbl-position')} ${i + 1}`}
        >
          <EulerInput
            //style={{ maxWidth: 'calc(100% - 2px)', paddingRight: `3px`, width: '100%' }}
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
