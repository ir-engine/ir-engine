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

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { SDFComponent } from '@etherealengine/engine/src/scene/components/SDFComponent'

import BooleanInput from '../inputs/BooleanInput'
import ColorInput from '../inputs/ColorInput'
import InputGroup from '../inputs/InputGroup'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, commitProperty, updateProperty } from './Util'

/**
 *
 *
 *
 * @type {[component class]}
 */
export const SDFEditor: EditorComponentType = (props) => {
  const sdfComponent = useComponent(props.entity, SDFComponent)

  return (
    <NodeEditor {...props} name={'SDF'} description={'Raymarching--torus and fog'}>
      <InputGroup name="Add Pass" label={'add pass to postprocess'}>
        <BooleanInput value={sdfComponent.enable.value} onChange={commitProperty(SDFComponent, 'enable')} />
      </InputGroup>
      <InputGroup name="Torus" label={'Torus'}></InputGroup>
      <InputGroup name="light Direction" label={'light direction on torus'}>
        <Vector3Input
          value={sdfComponent.lightDirection.value}
          onChange={updateProperty(SDFComponent, 'lightDirection')}
        />
      </InputGroup>
      <InputGroup name="position" label={'torus position'}>
        <Vector3Input
          value={sdfComponent.torusPosition.value}
          onChange={updateProperty(SDFComponent, 'torusPosition')}
        />
      </InputGroup>
      <InputGroup name="SDF" label={'color of torus'}>
        <ColorInput value={sdfComponent.color.value} onChange={updateProperty(SDFComponent, 'color')} />
      </InputGroup>
      <InputGroup name="Two Torus" label={'two torus'}>
        <BooleanInput
          value={sdfComponent.two.value}
          onChange={updateProperty(SDFComponent, 'two')}
          onRelease={commitProperty(SDFComponent, 'two')}
        />
      </InputGroup>
      <InputGroup name="Fog" label={'Fog'}></InputGroup>
      <InputGroup name="Fog" label={'switch to fog'}>
        <BooleanInput
          value={sdfComponent.fog.value}
          onChange={updateProperty(SDFComponent, 'fog')}
          onRelease={commitProperty(SDFComponent, 'fog')}
        />
      </InputGroup>
      <InputGroup name="Scale" label={'scale of fog'}>
        <Vector3Input value={sdfComponent.scale.value} onChange={updateProperty(SDFComponent, 'scale')} />
      </InputGroup>
    </NodeEditor>
  )
}

export default SDFEditor
