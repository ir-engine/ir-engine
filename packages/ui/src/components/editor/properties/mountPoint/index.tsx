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
import InputGroup from '@etherealengine/editor/src/components/inputs/InputGroup'
import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { MountPoint, MountPointComponent } from '@etherealengine/engine/src/scene/components/MountPointComponent'
import { LuUsers2 } from 'react-icons/lu'
import SelectInput from '../../input/Select'
import Vector3Input from '../../input/Vector3'
import NodeEditor from '../nodeEditor'

/**
 * MountPointNodeEditor component used to provide the editor view to customize Mount Point properties.
 *
 * @type {Class component}
 */
export const MountPointNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const mountComponent = useComponent(props.entity, MountPointComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.mountPoint.name')}
      description={t('editor:properties.mountPoint.description')}
      icon={<LuUsers2 />}
    >
      <InputGroup name="Mount Type" label={t('editor:properties.mountpoint.lbl-mountType')}>
        <SelectInput // we dont know the options and the component for this
          key={props.entity}
          value={mountComponent.type.value}
          options={Object.entries(MountPoint).map(([key, value]) => ({ label: key, value }))}
          onChange={commitProperty(MountPointComponent, 'type')}
        />
      </InputGroup>
      <InputGroup name="Dismount Offset" label={t('editor:properties.mountpoint.lbl-dismountOffset')}>
        <Vector3Input
          value={mountComponent.dismountOffset.value}
          onChange={updateProperty(MountPointComponent, 'dismountOffset')}
          onRelease={commitProperty(MountPointComponent, 'dismountOffset')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

MountPointNodeEditor.iconComponent = LuUsers2

export default MountPointNodeEditor
