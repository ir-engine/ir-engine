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

import { EntityUUID, UUIDComponent, getComponent, hasComponent, useComponent, useQuery } from '@ir-engine/ecs'
import {
  EditorComponentType,
  commitProperties,
  commitProperty,
  updateProperty
} from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { useHookstate } from '@ir-engine/hyperflux'
import { CallbackComponent } from '@ir-engine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@ir-engine/spatial/src/physics/components/TriggerComponent'
import { CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { EntityTreeComponent, useAncestorWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { GiTriggerHurt } from 'react-icons/gi'
import { HiPlus, HiTrash } from 'react-icons/hi2'
import Button from '../../../../primitives/tailwind/Button'
import { OptionType } from '../../../../primitives/tailwind/Select'
import InputGroup from '../../input/Group'
import NodeInput from '../../input/Node'
import SelectInput from '../../input/Select'
import StringInput from '../../input/String'

type TargetOptionType = { label: string; value: string; callbacks: OptionType[] }

const TriggerProperties: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const targets = useHookstate<TargetOptionType[]>([{ label: '', value: '', callbacks: [] }])

  const triggerComponent = useComponent(props.entity, TriggerComponent)
  const hasRigidbody = useAncestorWithComponents(props.entity, [RigidBodyComponent])

  const callbackQuery = useQuery([CallbackComponent])

  useEffect(() => {
    if (!hasComponent(props.entity, ColliderComponent)) {
      const nodes = SelectionState.getSelectedEntities()
      EditorControlFunctions.addOrRemoveComponent(nodes, ColliderComponent, true, {
        shape: Shapes.Sphere,
        collisionLayer: CollisionGroups.Trigger,
        collisionMask: CollisionGroups.Avatars
      })
    }

    const options = [] as TargetOptionType[]
    for (const entity of callbackQuery) {
      if (!hasComponent(entity, EntityTreeComponent)) continue
      const callbacks = getComponent(entity, CallbackComponent)
      options.push({
        label: getComponent(entity, NameComponent),
        value: getComponent(entity, UUIDComponent),
        callbacks: Object.keys(callbacks).map((cb) => ({ label: cb, value: cb }))
      })
    }
    targets.set(options)
  }, [callbackQuery])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.trigger.name')}
      description={t('editor:properties.trigger.description')}
      Icon={TriggerProperties.iconComponent}
    >
      <div className="my-3 flex justify-end">
        {!hasRigidbody && (
          <Button
            title={t('editor:properties.triggerVolume.lbl-addRigidBody')}
            startIcon={<HiPlus />}
            className="text-sm text-[#FFFFFF]"
            onClick={() => {
              const nodes = SelectionState.getSelectedEntities()
              EditorControlFunctions.addOrRemoveComponent(nodes, RigidBodyComponent, true, { type: 'fixed' })
            }}
          >
            {t('editor:properties.triggerVolume.lbl-addRigidBody')}
          </Button>
        )}
      </div>
      <div className="my-3 flex justify-end">
        <Button
          variant="transparent"
          title={t('editor:properties.triggerVolume.lbl-addTrigger')}
          startIcon={<HiPlus />}
          className="text-sm text-[#8B8B8D]"
          onClick={() => {
            const triggers = [
              ...triggerComponent.triggers.value,
              {
                target: '',
                onEnter: '',
                onExit: ''
              }
            ]
            commitProperties(TriggerComponent, { triggers: JSON.parse(JSON.stringify(triggers)) }, [props.entity])
          }}
        />
      </div>
      {triggerComponent.triggers.map((trigger, index) => {
        const targetOption = targets.value.find((o) => o.value === trigger.target.value)
        const target = targetOption ? targetOption.value : ''
        return (
          <div className="-ml-4 h-[calc(100%+1.5rem)] w-[calc(100%+2rem)] bg-[#1A1A1A] pb-1.5">
            <Button
              variant="transparent"
              title={t('editor:properties.triggerVolume.lbl-removeTrigger')}
              startIcon={<HiTrash />}
              className="ml-auto text-sm text-[#8B8B8D]"
              onClick={() => {
                const triggers = [...triggerComponent.triggers.value]
                triggers.splice(index, 1)
                commitProperties(TriggerComponent, { triggers: JSON.parse(JSON.stringify(triggers)) }, [props.entity])
              }}
            />
            <InputGroup
              name="Target"
              label={t('editor:properties.triggerVolume.lbl-target')}
              info={t('editor:properties.triggerVolume.info-target')}
            >
              <NodeInput
                value={trigger.target.value ?? ('' as EntityUUID)}
                onRelease={commitProperty(TriggerComponent, `triggers.${index}.target` as any)}
                disabled={props.multiEdit}
              />
            </InputGroup>
            <InputGroup
              name="On Enter"
              label={t('editor:properties.triggerVolume.lbl-onenter')}
              info={t(
                props.multiEdit || !target
                  ? 'editor:properties.triggerVolume.info-disabled-callback'
                  : 'editor:properties.triggerVolume.info-onenter'
              )}
            >
              {targetOption?.callbacks.length ? (
                <SelectInput
                  value={trigger.onEnter.value!}
                  onChange={commitProperty(TriggerComponent, `triggers.${index}.onEnter` as any)}
                  options={targetOption?.callbacks ? targetOption.callbacks.slice() : []}
                  disabled={props.multiEdit || !target}
                />
              ) : (
                <StringInput
                  value={trigger.onEnter.value!}
                  onChange={updateProperty(TriggerComponent, `triggers.${index}.onEnter` as any)}
                  onRelease={commitProperty(TriggerComponent, `triggers.${index}.onEnter` as any)}
                  disabled={props.multiEdit || !target}
                />
              )}
            </InputGroup>

            <InputGroup
              name="On Exit"
              label={t('editor:properties.triggerVolume.lbl-onexit')}
              info={t(
                props.multiEdit || !target
                  ? 'editor:properties.triggerVolume.info-disabled-callback'
                  : 'editor:properties.triggerVolume.info-onexit'
              )}
            >
              {targetOption?.callbacks.length ? (
                <SelectInput
                  value={trigger.onExit.value!}
                  onChange={commitProperty(TriggerComponent, `triggers.${index}.onExit` as any)}
                  options={targetOption?.callbacks ? targetOption.callbacks.slice() : []}
                  disabled={props.multiEdit || !target}
                />
              ) : (
                <StringInput
                  value={trigger.onExit.value!}
                  onRelease={updateProperty(TriggerComponent, `triggers.${index}.onExit` as any)}
                  onChange={commitProperty(TriggerComponent, `triggers.${index}.onExit` as any)}
                  disabled={props.multiEdit || !target}
                />
              )}
            </InputGroup>
          </div>
        )
      })}
    </NodeEditor>
  )
}

TriggerProperties.iconComponent = GiTriggerHurt
export default TriggerProperties
