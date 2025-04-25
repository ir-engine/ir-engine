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

import {
  getAncestorWithComponents,
  hasComponent,
  useAncestorWithComponents,
  useComponent
} from '@ir-engine/ecs'
import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { EntityTeleportTriggerComponent } from '@ir-engine/engine/src/scene/components/EntityTeleportTriggerComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@ir-engine/spatial/src/physics/components/TriggerComponent'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { GiPortal } from 'react-icons/gi'
import { HiPlus } from 'react-icons/hi2'
import Button from '../../../../primitives/tailwind/Button'
import Checkbox from '../../../../primitives/tailwind/Checkbox'
import InputGroup from '../../input/Group'
import NodeInput from '../../input/Node'
import Vector3Input from '../../input/Vector3'

const EntityTeleportTriggerEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const component = useComponent(props.entity, EntityTeleportTriggerComponent)
  const hasRigidbody = useAncestorWithComponents(props.entity, [RigidBodyComponent])
  const hasTrigger = hasComponent(props.entity, TriggerComponent)

  useEffect(() => {
    // Ensure the entity has a ColliderComponent
    if (!hasComponent(props.entity, ColliderComponent)) {
      const nodes = SelectionState.getSelectedEntities()
      EditorControlFunctions.addOrRemoveComponent(nodes, ColliderComponent, true)
    }

    // Ensure the entity has a RigidBodyComponent ancestor
    if (!getAncestorWithComponents(props.entity, [RigidBodyComponent])) {
      const nodes = SelectionState.getSelectedEntities()
      EditorControlFunctions.addOrRemoveComponent(nodes, RigidBodyComponent, true, { type: 'fixed' })
    }

    // Ensure the entity has a TriggerComponent
    if (!hasTrigger) {
      const nodes = SelectionState.getSelectedEntities()
      EditorControlFunctions.addOrRemoveComponent(nodes, TriggerComponent, true)
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.entityTeleportTrigger.name', 'Entity Teleport Trigger')}
      description={t('editor:properties.entityTeleportTrigger.description', 'Teleports the avatar to a specified entity when triggered')}
      Icon={EntityTeleportTriggerEditor.iconComponent}
    >
      <div className="my-3 flex justify-end">
        {!hasRigidbody && (
          <Button
            title={t('editor:properties.triggerVolume.lbl-addRigidBody')}
            className="text-text-primary"
            variant="tertiary"
            onClick={() => {
              const nodes = SelectionState.getSelectedEntities()
              EditorControlFunctions.addOrRemoveComponent(nodes, RigidBodyComponent, true, { type: 'fixed' })
            }}
          >
            <HiPlus />
            {t('editor:properties.triggerVolume.lbl-addRigidBody')}
          </Button>
        )}
      </div>

      <InputGroup
        name="TargetEntity"
        label={t('editor:properties.entityTeleportTrigger.lbl-targetEntity', 'Target Entity')}
        info={t('editor:properties.entityTeleportTrigger.info-targetEntity', 'The entity to teleport to')}
      >
        <NodeInput
          value={component.targetEntityUUID.value ?? ''}
          onChange={updateProperty(EntityTeleportTriggerComponent, 'targetEntityUUID')}
          onRelease={commitProperty(EntityTeleportTriggerComponent, 'targetEntityUUID')}
          disabled={props.multiEdit}
        />
      </InputGroup>

      <InputGroup
        name="Offset"
        label={t('editor:properties.entityTeleportTrigger.lbl-offset', 'Offset')}
        info={t('editor:properties.entityTeleportTrigger.info-offset', 'Offset from the target entity position')}
      >
        <Vector3Input
          value={{ 
            x: component.offset.value.x, 
            y: component.offset.value.y, 
            z: component.offset.value.z 
          }}
          onChange={updateProperty(EntityTeleportTriggerComponent, 'offset')}
          onRelease={commitProperty(EntityTeleportTriggerComponent, 'offset')}
        />
      </InputGroup>

      <InputGroup
        name="Force"
        label={t('editor:properties.entityTeleportTrigger.lbl-force', 'Force Teleport')}
        info={t('editor:properties.entityTeleportTrigger.info-force', 'Force teleport even if position is invalid')}
      >
        <Checkbox 
          checked={component.force.value} 
          onChange={commitProperty(EntityTeleportTriggerComponent, 'force')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

EntityTeleportTriggerEditor.iconComponent = GiPortal
export default EntityTeleportTriggerEditor
