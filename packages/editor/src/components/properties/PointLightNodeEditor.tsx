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
import { PointLightComponent } from '@etherealengine/engine/src/scene/components/PointLightComponent'

import LightbulbIcon from '@mui/icons-material/Lightbulb'

import ColorInput from '../inputs/ColorInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import LightShadowProperties from './LightShadowProperties'
import NodeEditor from './NodeEditor'
import { EditorComponentType, commitProperty, updateProperty } from './Util'

export const PointLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const lightComponent = useComponent(props.entity, PointLightComponent).value

  return (
    <NodeEditor {...props} description={t('editor:properties.pointLight.description')}>
      <InputGroup name="Color" label={t('editor:properties.pointLight.lbl-color')}>
        <ColorInput
          value={lightComponent.color}
          onChange={updateProperty(PointLightComponent, 'color')}
          onRelease={commitProperty(PointLightComponent, 'color')}
        />
      </InputGroup>
      <NumericInputGroup
        name="Intensity"
        label={t('editor:properties.pointLight.lbl-intensity')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={lightComponent.intensity}
        onChange={updateProperty(PointLightComponent, 'intensity')}
        onRelease={commitProperty(PointLightComponent, 'intensity')}
        unit="cd"
      />
      <NumericInputGroup
        name="Range"
        label={t('editor:properties.pointLight.lbl-range')}
        min={0}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={lightComponent.range}
        onChange={updateProperty(PointLightComponent, 'range')}
        onRelease={commitProperty(PointLightComponent, 'range')}
        unit="m"
      />
      <NumericInputGroup
        name="Decay"
        label={t('editor:properties.pointLight.lbl-decay')}
        min={0}
        smallStep={0.1}
        mediumStep={1}
        largeStep={10}
        value={lightComponent.decay}
        onChange={updateProperty(PointLightComponent, 'decay')}
        onRelease={commitProperty(PointLightComponent, 'decay')}
      />
      <LightShadowProperties entity={props.entity} comp={PointLightComponent} />
    </NodeEditor>
  )
}

PointLightNodeEditor.iconComponent = LightbulbIcon

export default PointLightNodeEditor
