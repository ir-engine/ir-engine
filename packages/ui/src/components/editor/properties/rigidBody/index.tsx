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

import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdPanTool } from 'react-icons/md'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { camelCaseToSpacedString } from '@ir-engine/common/src/utils/camelCaseToSpacedString'
import { EntityTreeComponent, getAncestorWithComponents, getChildrenWithComponents } from '@ir-engine/ecs'
import { getComponent, useComponent, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { useImmediateEffect } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { BodyTypes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'

const bodyTypeOptions = Object.entries(BodyTypes).map(([label, value]) => {
  return { label: camelCaseToSpacedString(label as string), value }
})

export const RigidBodyComponentEditor: EditorComponentType = (props) => {
  const { entity } = props
  const { t } = useTranslation()
  const rigidbodyComponent = useComponent(entity, RigidBodyComponent)
  const children = useOptionalComponent(entity, EntityTreeComponent)?.children

  const removeDuplicateRigidbody = () => {
    const rigidbodyAlreadyInHierarchy = !!(
      getAncestorWithComponents(entity, [RigidBodyComponent], true, false) ||
      getChildrenWithComponents(entity, [RigidBodyComponent]).length
    )

    if (rigidbodyAlreadyInHierarchy) {
      NotificationService.dispatchNotify(
        t('editor:properties.rigidbody.duplicateError', { entity: entity, name: getComponent(entity, NameComponent) }),
        { variant: 'error' }
      )
      EditorControlFunctions.addOrRemoveComponent([entity], RigidBodyComponent, false)
    }
  }

  useImmediateEffect(() => {
    removeDuplicateRigidbody()
  }, [children])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.rigidbody.name')}
      description={t('editor:properties.rigidbody.description')}
      Icon={RigidBodyComponentEditor.iconComponent}
    >
      <InputGroup name="Type" label={t('editor:properties.rigidbody.lbl-type')}>
        <SelectInput
          options={bodyTypeOptions}
          value={rigidbodyComponent.type.value}
          onChange={commitProperty(RigidBodyComponent, 'type')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

RigidBodyComponentEditor.iconComponent = MdPanTool

export default RigidBodyComponentEditor
