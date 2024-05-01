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

import { camelCaseToSpacedString } from '@etherealengine/common/src/utils/camelCaseToSpacedString'
import { EditorComponentType } from '@etherealengine/editor/src/components/properties/Util'
import { supportedColliderShapes } from '@etherealengine/spatial/src/physics/components/ColliderComponent'
import { Shapes } from '@etherealengine/spatial/src/physics/types/PhysicsTypes'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FiMinimize2 } from 'react-icons/fi'
import Select from '../../../../primitives/tailwind/Select'
import BooleanInput from '../../input/Boolean'
import InputGroup from '../../input/Group'
import NodeEditor from '../nodeEditor'
import TriggerProperties from '../trigger'

const shapeTypeOptions = Object.entries(Shapes)
  .filter(([_, value]) => supportedColliderShapes.includes(value as any))
  .map(([label, value]) => {
    return { label: camelCaseToSpacedString(label), value }
  })

export const ColliderComponentEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  //const spawnComponent = useComponent(props.entity, SpawnPointComponent)
  const elements = ['hello', 'bye', 'thanks'] // temp use

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.collider.name')}
      description={t('editor:properties.collider.description')}
      icon={<FiMinimize2 />}
    >
      <InputGroup name="Body type" label={t('editor:properties.collider.lbl-type')}>
        <Select
          options={[]}
          value={
            'Fixed'
            // colliderComponent.bodyType.value
          }
          onChange={
            () => {}
            // commitProperty(ColliderComponent, 'bodyType')
          }
        />
      </InputGroup>
      <InputGroup name="Shape" label={t('editor:properties.collider.lbl-shape')}>
        <Select
          options={shapeTypeOptions}
          value={
            'sphere'
            // colliderComponent.shape.value
          }
          onChange={
            () => {}
            // commitProperty(ColliderComponent, 'shape')
          }
        />
      </InputGroup>
      <InputGroup name="Remove mesh" label={t('editor:properties.collider.lbl-removeMesh')}>
        <BooleanInput
          value={
            true
            // colliderComponent.removeMesh.value
          }
          onChange={
            () => {}
            //commitProperty(ColliderComponent, 'removeMesh')
          }
        />
      </InputGroup>
      <TriggerProperties {...props} />
    </NodeEditor>
  )
}

ColliderComponentEditor.iconComponent = FiMinimize2

export default ColliderComponentEditor
