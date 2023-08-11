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
import { SplineTrackComponent } from '@etherealengine/engine/src/scene/components/SplineTrackComponent'

import CameraswitchIcon from '@mui/icons-material/Cameraswitch'

import NumericInput from '../inputs/NumericInput'
import { Vector3Scrubber } from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

/**
 * SplineTrackNodeEditor adds rotation editing to splines.
 *
 * @param       {Object} props
 * @constructor
 */

export const SplineTrackNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const component = useComponent(props.entity, SplineTrackComponent)
  const velocity = component.velocity.value

  // these could be exposed to outside parties by being passed in
  const onChange = () => {}
  const onRelease = () => {}

  const processChange = (value) => {
    component.velocity.set(value)
    //if(onChange)onChange()
  }

  return (
    <NodeEditor description={t('editor:properties.splinetrack.description')} {...props}>
      <NumericInput
        value={velocity}
        onChange={processChange}
        onCommit={onRelease}
        prefix={
          <Vector3Scrubber tag="div" value={velocity} onChange={processChange} onPointerUp={onRelease} axis="velocity">
            Velocity
          </Vector3Scrubber>
        }
      />
    </NodeEditor>
  )
}

SplineTrackNodeEditor.iconComponent = CameraswitchIcon

export default SplineTrackNodeEditor
