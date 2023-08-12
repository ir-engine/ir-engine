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

import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
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
  const velocity = component.velocity
  const alpha = component.velocity

  // @todo allow these to be passed in or remove this capability
  const onChange = () => {}
  const onRelease = () => {}

  const setAlpha = (value) => {
    component.alpha.set(value)
  }

  const setRunning = (value) => {
    component.disableRunning.set(component.disableRunning.value ? false : true)
  }

  const setVelocity = (value) => {
    component.velocity.set(value)
  }

  const setRoll = () => {
    component.disableRoll.set(component.disableRoll.value ? false : true)
  }

  return (
    <NodeEditor description={t('editor:properties.splinetrack.description')} {...props}>
      <InputGroup name="Toggle Roll" label={t('editor:properties.splinetrack.lbl-roll')}>
        <BooleanInput value={component.disableRoll.value} onChange={setRoll} />
      </InputGroup>
      <InputGroup name="Toggle Running" label={t('editor:properties.splinetrack.lbl-running')}>
        <BooleanInput value={component.disableRunning.value} onChange={setRunning} />
      </InputGroup>
      <InputGroup name="Alpha" label={t('editor:properties.splinetrack.lbl-alpha')}>
        <NumericInput
          value={alpha.value}
          onChange={setVelocity}
          onCommit={onRelease}
          prefix={
            <Vector3Scrubber tag="div" value={alpha.value} onChange={setVelocity} onPointerUp={onRelease} axis="alpha">
              Alpha
            </Vector3Scrubber>
          }
        />
      </InputGroup>
      <InputGroup name="Velocity" label={t('editor:properties.splinetrack.lbl-velocity')}>
        <NumericInput
          value={velocity.value}
          onChange={setVelocity}
          onCommit={onRelease}
          prefix={
            <Vector3Scrubber
              tag="div"
              value={velocity.value}
              onChange={setVelocity}
              onPointerUp={onRelease}
              axis="velocity"
            >
              Velocity
            </Vector3Scrubber>
          }
        />
      </InputGroup>
    </NodeEditor>
  )
}

SplineTrackNodeEditor.iconComponent = CameraswitchIcon

export default SplineTrackNodeEditor
