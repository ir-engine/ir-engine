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

import { useComponent } from '@etherealengine/ecs'
import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { AmbientLightComponent } from '@etherealengine/spatial/src/renderer/components/lights/AmbientLightComponent'
import { HiOutlineSun } from 'react-icons/hi2'
import ColorInput from '../../../../../primitives/tailwind/Color'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'
import NodeEditor from '../../nodeEditor'

/**
 * AmbientLightNodeEditor component used to customize the ambient light element on the scene
 * ambient light is basically used to illuminates all the objects present inside the scene.
 */
export const AmbientLightNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const lightComponent = useComponent(props.entity, AmbientLightComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.ambientLight.name')}
      description={t('editor:properties.ambientLight.description')}
      icon={<AmbientLightNodeEditor.iconComponent />}
    >
      <InputGroup name="Color" label={t('editor:properties.ambientLight.lbl-color')}>
        <ColorInput
          className="bg-[#1A1A1A]"
          textClassName="text-white"
          value={lightComponent.color.value}
          onChange={updateProperty(AmbientLightComponent, 'color')}
        />
      </InputGroup>
      <InputGroup name="Intensity" label={t('editor:properties.ambientLight.lbl-intensity')}>
        <NumericInput
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={lightComponent.intensity.value}
          onChange={updateProperty(AmbientLightComponent, 'intensity')}
          onRelease={commitProperty(AmbientLightComponent, 'intensity')}
          unit="cd"
        />
      </InputGroup>
    </NodeEditor>
  )
}

AmbientLightNodeEditor.iconComponent = HiOutlineSun

export default AmbientLightNodeEditor
