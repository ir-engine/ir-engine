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
import { MdPanTool } from 'react-icons/md'

import { camelCaseToSpacedString } from '@etherealengine/common/src/utils/camelCaseToSpacedString'
import { useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty } from '@etherealengine/editor/src/components/properties/Util'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { BodyTypes } from '@etherealengine/spatial/src/physics/types/PhysicsTypes'
import Select from '../../../../primitives/tailwind/Select'
import InputGroup from '../../input/Group'
import NodeEditor from '../nodeEditor'

const bodyTypeOptions = Object.entries(BodyTypes).map(([label, value]) => {
  return { label: camelCaseToSpacedString(label as string), value }
})

export const RigidBodyComponentEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const rigidbodyComponent = useComponent(props.entity, RigidBodyComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.rigidbody.name')}
      description={t('editor:properties.rigidbody.description')}
    >
      <InputGroup name="Type" label={t('editor:properties.rigidbody.lbl-type')}>
        <Select
          options={bodyTypeOptions}
          currentValue={rigidbodyComponent.type.value}
          onChange={commitProperty(RigidBodyComponent, 'type')}
          inputClassName="text-xs p-2"
        />
      </InputGroup>
    </NodeEditor>
  )
}

RigidBodyComponentEditor.iconComponent = MdPanTool

export default RigidBodyComponentEditor
