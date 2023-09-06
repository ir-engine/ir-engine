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

import { getComponent, useComponent, useQuery } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { SplineTrackComponent } from '@etherealengine/engine/src/scene/components/SplineTrackComponent'

import CameraswitchIcon from '@mui/icons-material/Cameraswitch'

import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { SplineComponent } from '@etherealengine/engine/src/scene/components/SplineComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NumericInput from '../inputs/NumericInput'
import SelectInput from '../inputs/SelectInput'
import { Vector3Scrubber } from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

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

  const availableSplines = useQuery([SplineComponent]).map((entity) => {
    const name = getComponent(entity, NameComponent)
    const uuid = getComponent(entity, UUIDComponent)
    return {
      label: name,
      value: uuid
    }
  })

  // @todo allow these to be passed in or remove this capability
  const onChange = () => {}
  const onRelease = () => {}

  const setAlpha = (value) => {
    component.alpha.set(value)
  }

  const setRunning = (value) => {
    component.loop.set(component.loop.value ? false : true)
  }

  const setVelocity = (value) => {
    component.velocity.set(value)
  }

  const setRoll = () => {
    component.enableRotation.set(component.enableRotation.value ? false : true)
  }

  return (
    <NodeEditor description={t('editor:properties.splinetrack.description')} {...props}>
      <InputGroup name="Spline" label={t('editor:properties.splinetrack.lbl-spline')}>
        <SelectInput
          key={props.entity}
          options={availableSplines}
          value={component.splineEntityUUID.value!}
          onChange={updateProperty(SplineTrackComponent, 'splineEntityUUID') as any}
        />
      </InputGroup>
      <InputGroup name="Velocity" label={t('editor:properties.splinetrack.lbl-velocity')}>
        <NumericInput
          value={velocity.value}
          onChange={setVelocity}
          onCommit={onRelease}
          prefix={<Vector3Scrubber tag="div" value={velocity.value} onChange={setVelocity} onPointerUp={onRelease} />}
        />
      </InputGroup>
      <InputGroup name="Enable Rotation" label={t('editor:properties.splinetrack.lbl-enableRotation')}>
        <BooleanInput
          value={component.enableRotation.value}
          onChange={updateProperty(SplineTrackComponent, 'enableRotation')}
        />
      </InputGroup>
      <InputGroup name="Lock XZ" label={t('editor:properties.splinetrack.lbl-lockXZ')}>
        <BooleanInput
          value={component.lockToXZPlane.value}
          onChange={updateProperty(SplineTrackComponent, 'lockToXZPlane')}
        />
      </InputGroup>
      <InputGroup name="Loop" label={t('editor:properties.splinetrack.lbl-loop')}>
        <BooleanInput value={component.loop.value} onChange={updateProperty(SplineTrackComponent, 'loop')} />
      </InputGroup>
    </NodeEditor>
  )
}

SplineTrackNodeEditor.iconComponent = CameraswitchIcon

export default SplineTrackNodeEditor
