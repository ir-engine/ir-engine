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

import { getMutableComponent, useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { MountPoint, MountPointComponent } from '@etherealengine/engine/src/scene/components/MountPointComponent'

import { Vector3 } from 'three'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorPropType, commitProperty } from './Util'

const MountPointTypes = [{ label: 'Seat', value: MountPoint.seat }]

export const MountPointNodeEditor: React.FC<EditorPropType> = (props) => {
  const { t } = useTranslation()

  const mountPointComponent = useComponent(props.entity, MountPointComponent)

  const onChangeOffset = (value: Vector3) => {
    getMutableComponent(props.entity, MountPointComponent).dismountOffset.set(value)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.mountPoint.name')}
      description={t('editor:properties.mountPoint.description')}
    >
      <InputGroup name="Type" label={t('editor:properties.mountPoint.lbl-type')}>
        <SelectInput
          key={props.entity}
          options={MountPointTypes}
          value={mountPointComponent.type.value}
          onChange={commitProperty(MountPointComponent, 'type')}
        />
      </InputGroup>
      <InputGroup name="Position Offset" label={t('editor:properties.mountPoint.lbl-dismount')}>
        <Vector3Input
          value={mountPointComponent.dismountOffset.value}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangeOffset}
        />
      </InputGroup>
    </NodeEditor>
  )
}

export default MountPointNodeEditor
