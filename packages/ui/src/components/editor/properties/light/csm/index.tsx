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
import { useComponent } from '@etherealengine/ecs'
import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { CSMLightComponent } from '@etherealengine/spatial/src/renderer/components/CSMLightComponent'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { BsLightning } from 'react-icons/bs'
import ColorInput from '../../../../../primitives/tailwind/Color'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'
import NodeEditor from '../../nodeEditor'
import LightShadowProperties from '../shadowProperties'

/**
 * DirectionalLightNodeEditor is used provides  properties to customize DirectionaLight element.
 */
export const CSMLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const lightComponent = useComponent(props.entity, CSMLightComponent).value

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.csmLight.name')}
      description={t('editor:properties.csmLight.description')}
      icon={<CSMLightNodeEditor.iconComponent />}
    >
      <InputGroup name="Color" label={t('editor:properties.directionalLight.lbl-color')}>
        <ColorInput
          className="bg-[#1A1A1A]"
          value={lightComponent.color}
          onChange={updateProperty(CSMLightComponent, 'color')}
        />
      </InputGroup>
      <InputGroup name="Intensity" label={t('editor:properties.directionalLight.lbl-intensity')}>
        <NumericInput
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={lightComponent.intensity}
          onChange={updateProperty(CSMLightComponent, 'intensity')}
          onRelease={commitProperty(CSMLightComponent, 'intensity')}
          unit="cd"
        />
      </InputGroup>
      <LightShadowProperties entity={props.entity} component={CSMLightComponent} />
      <InputGroup name="Camera Near" label={t('editor:properties.directionalLight.lbl-cameraNear')}>
        <NumericInput
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={lightComponent.maxFar}
          onChange={updateProperty(CSMLightComponent, 'maxFar')}
          onRelease={commitProperty(CSMLightComponent, 'maxFar')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

CSMLightNodeEditor.iconComponent = BsLightning

export default CSMLightNodeEditor
