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

import { t } from 'i18next'
import React from 'react'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { commitProperty, EditorComponentType, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { HiOutlineCamera } from 'react-icons/hi'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import NodeEditor from '../nodeEditor'

export const CameraNodeEditor: EditorComponentType = (props) => {
  const component = useComponent(props.entity, CameraComponent)

  return (
    <NodeEditor
      name={t('editor:properties.cameraComponent.name')}
      description={t('editor:properties.cameraComponent.description')}
      icon={<CameraNodeEditor.iconComponent />}
      {...props}
    >
      <InputGroup name="Fov" label={t('editor:properties.cameraComponent.lbl-fov')}>
        <NumericInput
          value={component.fov.value}
          onChange={updateProperty(CameraComponent, 'fov')}
          onRelease={commitProperty(CameraComponent, 'fov')}
        />
      </InputGroup>
      <InputGroup name="Aspect" label={t('editor:properties.cameraComponent.lbl-aspect')}>
        <NumericInput
          value={component.aspect.value}
          onChange={updateProperty(CameraComponent, 'aspect')}
          onRelease={commitProperty(CameraComponent, 'aspect')}
        />
      </InputGroup>
      <InputGroup name="Near" label={t('editor:properties.cameraComponent.lbl-near')}>
        <NumericInput
          value={component.aspect.value}
          onChange={updateProperty(CameraComponent, 'near')}
          onRelease={commitProperty(CameraComponent, 'near')}
        />
      </InputGroup>
      <InputGroup name="Far" label={t('editor:properties.cameraComponent.lbl-far')}>
        <NumericInput
          value={component.aspect.value}
          onChange={updateProperty(CameraComponent, 'far')}
          onRelease={commitProperty(CameraComponent, 'far')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

CameraNodeEditor.iconComponent = HiOutlineCamera

export default CameraNodeEditor
