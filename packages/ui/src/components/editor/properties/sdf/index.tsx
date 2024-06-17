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

import { useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty } from '@etherealengine/editor/src/components/properties/Util'
import { SDFComponent, SDFMode } from '@etherealengine/engine/src/scene/components/SDFComponent'
import { GiExplosionRays } from 'react-icons/gi'
import ColorInput from '../../../../primitives/tailwind/Color'
import BooleanInput from '../../input/Boolean'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'
import Vector3Input from '../../input/Vector3'
import NodeEditor from '../nodeEditor'

export const SDFEditor: EditorComponentType = (props) => {
  const sdfComponent = useComponent(props.entity, SDFComponent)

  return (
    <NodeEditor {...props} name={'SDF'} description={'Raymarching--torus and fog'} icon={<SDFEditor.iconComponent />}>
      <InputGroup name="Add Pass" label={'add pass to postprocess'}>
        <BooleanInput value={sdfComponent.enable.value} onChange={commitProperty(SDFComponent, 'enable')} />
      </InputGroup>
      <InputGroup name="Mode" label="Mode">
        <SelectInput
          value={sdfComponent.mode.value}
          options={[
            { label: 'torus', value: SDFMode.TORUS },
            { label: 'fog', value: SDFMode.FOG }
          ]}
          onChange={commitProperty(SDFComponent, 'mode')}
        />
      </InputGroup>
      <InputGroup name="Color" label="Color">
        <ColorInput value={sdfComponent.color.value} onChange={commitProperty(SDFComponent, 'color')} />
      </InputGroup>
      <InputGroup name="Scale" label="Scale">
        <Vector3Input value={sdfComponent.scale.value} onChange={commitProperty(SDFComponent, 'scale')} />
      </InputGroup>
    </NodeEditor>
  )
}
SDFEditor.iconComponent = GiExplosionRays
export default SDFEditor
