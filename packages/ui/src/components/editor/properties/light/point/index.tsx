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

import { PointLightComponent } from '@etherealengine/spatial/src/renderer/components/lights/PointLightComponent'

import { useComponent } from '@etherealengine/ecs'
import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { AiOutlineBulb } from 'react-icons/ai'
import ColorInput from '../../../../../primitives/tailwind/Color'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'
import NodeEditor from '../../nodeEditor'
import LightShadowProperties from '../shadowProperties'

export const PointLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const lightComponent = useComponent(props.entity, PointLightComponent).value

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.pointLight.name')}
      description={t('editor:properties.pointLight.description')}
      icon={<PointLightNodeEditor.iconComponent />}
    >
      <InputGroup name="Color" label={t('editor:properties.pointLight.lbl-color')}>
        <ColorInput
          value={lightComponent.color}
          onChange={updateProperty(PointLightComponent, 'color')}
          onRelease={commitProperty(PointLightComponent, 'color')}
        />
      </InputGroup>
      <InputGroup name="Intensity" label={t('editor:properties.pointLight.lbl-intensity')}>
        <NumericInput
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={lightComponent.intensity}
          onChange={updateProperty(PointLightComponent, 'intensity')}
          onRelease={commitProperty(PointLightComponent, 'intensity')}
          unit="cd"
        />
      </InputGroup>
      <InputGroup name="Range" label={t('editor:properties.pointLight.lbl-range')}>
        <NumericInput
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={lightComponent.range}
          onChange={updateProperty(PointLightComponent, 'range')}
          onRelease={commitProperty(PointLightComponent, 'range')}
          unit="m"
        />
      </InputGroup>
      <InputGroup name="Decay" label={t('editor:properties.pointLight.lbl-decay')}>
        <NumericInput
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={lightComponent.decay}
          onChange={updateProperty(PointLightComponent, 'decay')}
          onRelease={commitProperty(PointLightComponent, 'decay')}
        />
      </InputGroup>
      <LightShadowProperties entity={props.entity} component={PointLightComponent} />
    </NodeEditor>
  )
}

PointLightNodeEditor.iconComponent = AiOutlineBulb

export default PointLightNodeEditor
