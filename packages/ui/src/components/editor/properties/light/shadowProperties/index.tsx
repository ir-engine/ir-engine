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

import { useTranslation } from 'react-i18next'

import { Component, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import React from 'react'
import BooleanInput from '../../../input/Boolean'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'

/**creating properties for LightShadowProperties component */
type LightShadowPropertiesProps = {
  entity: Entity
  comp: Component<any, any>
}

/**
 * OnChangeShadowMapResolution used to customize properties of LightShadowProperties
 * Used with LightNodeEditors.
 */
export const LightShadowProperties: EditorComponentType = (props: LightShadowPropertiesProps) => {
  const { t } = useTranslation()

  const lightComponent = useComponent(props.entity, props.comp).value as any

  return (
    <>
      <InputGroup name="Cast Shadows" label={t('editor:properties.directionalLight.lbl-castShadows')}>
        <BooleanInput value={lightComponent.castShadow} onChange={commitProperty(props.comp, 'castShadow')} />
      </InputGroup>
      <InputGroup name="Shadow Bias" label={t('editor:properties.directionalLight.lbl-shadowBias')}>
        <NumericInput
          max={0.001}
          min={-0.001}
          mediumStep={0.0000001}
          smallStep={0.000001}
          largeStep={0.0001}
          displayPrecision={0.000001}
          value={lightComponent.shadowBias}
          onChange={updateProperty(props.comp, 'shadowBias')}
          onRelease={commitProperty(props.comp, 'shadowBias')}
        />
      </InputGroup>
      <InputGroup name="Shadow Radius" label={t('editor:properties.directionalLight.lbl-shadowRadius')}>
        <NumericInput
          mediumStep={0.01}
          smallStep={0.1}
          largeStep={1}
          displayPrecision={0.0001}
          value={lightComponent.shadowRadius}
          onChange={updateProperty(props.comp, 'shadowRadius')}
          onRelease={commitProperty(props.comp, 'shadowRadius')}
        />
      </InputGroup>
    </>
  )
}

export default LightShadowProperties
