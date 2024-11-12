/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { SpotLightComponent } from '@ir-engine/spatial/src/renderer/components/lights/SpotLightComponent'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { LuCircleDot } from 'react-icons/lu'
import { MathUtils as _Math } from 'three'

import { useComponent } from '@ir-engine/ecs'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { Checkbox } from '@ir-engine/ui'
import ColorInput from '../../../../../primitives/tailwind/Color'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'

/**
 * SpotLightNodeEditor component class used to provide editor view for property customization.
 */
export const SpotLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const lightComponent = useComponent(props.entity, SpotLightComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.spotLight.name')}
      description={t('editor:properties.spotLight.description')}
      Icon={SpotLightNodeEditor.iconComponent}
    >
      <InputGroup name="Color" label={t('editor:properties.spotLight.lbl-color')}>
        <ColorInput
          value={lightComponent.color.value}
          onChange={updateProperty(SpotLightComponent, 'color')}
          onRelease={commitProperty(SpotLightComponent, 'color')}
        />
      </InputGroup>
      <InputGroup name="Intensity" label={t('editor:properties.spotLight.lbl-intensity')}>
        <NumericInput
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={lightComponent.intensity.value}
          onChange={updateProperty(SpotLightComponent, 'intensity')}
          onRelease={commitProperty(SpotLightComponent, 'intensity')}
        />
      </InputGroup>
      <InputGroup name="Penumbra" label={t('editor:properties.spotLight.lbl-penumbra')}>
        <NumericInput
          min={0}
          max={1}
          smallStep={0.01}
          mediumStep={0.1}
          value={lightComponent.penumbra.value}
          onChange={updateProperty(SpotLightComponent, 'penumbra')}
          onRelease={commitProperty(SpotLightComponent, 'penumbra')}
        />
      </InputGroup>
      <InputGroup name="Angle" label={t('editor:properties.spotLight.lbl-angle')}>
        <NumericInput
          min={0}
          max={90}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={_Math.radToDeg(lightComponent.angle.value)}
          onChange={(value) => updateProperty(SpotLightComponent, 'angle')(_Math.degToRad(value))}
          onRelease={(value) => commitProperty(SpotLightComponent, 'angle')(_Math.degToRad(value))}
          unit="°"
        />
      </InputGroup>
      <InputGroup name="Range" label={t('editor:properties.spotLight.lbl-range')}>
        <NumericInput
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={lightComponent.range.value}
          onChange={updateProperty(SpotLightComponent, 'range')}
          onRelease={commitProperty(SpotLightComponent, 'range')}
          unit="m"
        />
      </InputGroup>
      <InputGroup name="Decay" label={t('editor:properties.spotLight.lbl-decay')}>
        <NumericInput
          min={0}
          max={10}
          smallStep={0.1}
          mediumStep={1}
          value={lightComponent.decay.value}
          onChange={updateProperty(SpotLightComponent, 'decay')}
          onRelease={commitProperty(SpotLightComponent, 'decay')}
        />
      </InputGroup>
      <InputGroup name="castShadow" label={t('editor:properties.spotLight.lbl-castShadow')}>
        <Checkbox
          onChange={commitProperty(SpotLightComponent, 'castShadow')}
          checked={lightComponent.castShadow.value}
        />
      </InputGroup>
      <InputGroup name="ShadowBias" label={t('editor:properties.spotLight.lbl-shadowBias')}>
        <NumericInput
          min={0}
          max={1}
          smallStep={0.00001}
          mediumStep={0.001}
          value={lightComponent.shadowBias.value}
          onChange={updateProperty(SpotLightComponent, 'shadowBias')}
          onRelease={commitProperty(SpotLightComponent, 'shadowBias')}
        />
      </InputGroup>
      <InputGroup name="ShadowRadius" label={t('editor:properties.spotLight.lbl-shadowRadius')}>
        <NumericInput
          smallStep={0.1}
          mediumStep={1}
          value={lightComponent.shadowRadius.value}
          onChange={updateProperty(SpotLightComponent, 'shadowRadius')}
          onRelease={commitProperty(SpotLightComponent, 'shadowRadius')}
        />
      </InputGroup>
      {/* <LightShadowProperties entity={props.entity} component={SpotLightComponent} /> */}
    </NodeEditor>
  )
}

SpotLightNodeEditor.iconComponent = LuCircleDot

export default SpotLightNodeEditor
