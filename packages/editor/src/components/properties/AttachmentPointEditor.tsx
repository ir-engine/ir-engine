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

import {
  TransformComponent,
  TransformComponentType
} from '@etherealengine/engine/src/transform/components/TransformComponent'
import { State } from '@hookstate/core'
import EulerInput from '../inputs/EulerInput'
import InputGroup from '../inputs/InputGroup'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

/**
 *
 * AmbientLightNodeEditor component used to customize the ambient light element on the scene
 * ambient light is basically used to illuminates all the objects present inside the scene.
 *
 * @type {[component class]}
 */
export const AttachmentPointComponentEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const transformComponent = useComponent(props.entity, TransformComponent)
  // const attachComponent = useComponent(props.entity, AttachmentPointComponent)
  const transform: State<TransformComponentType> = transformComponent

  return (
    <NodeEditor {...props} name={t('AttachmentPoint')} description={t('editor:attachment point')}>
      <InputGroup name="attach" label={t('attachment point')}>
        <InputGroup name="Position" label={t('editor:properties.transform.lbl-position')}>
          <Vector3Input value={transform.position.value} smallStep={0.01} mediumStep={0.1} largeStep={1} />
        </InputGroup>
        <InputGroup name="Rotation" label={t('editor:properties.transform.lbl-rotation')}>
          <EulerInput quaternion={transform.rotation.value} unit="°" />
        </InputGroup>
        <InputGroup name="Scale" label={t('editor:properties.transform.lbl-scale')}>
          <Vector3Input uniformScaling smallStep={0.01} mediumStep={0.1} largeStep={1} value={transform.scale.value} />
        </InputGroup>
      </InputGroup>
    </NodeEditor>
  )
}

export default AttachmentPointComponentEditor
