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

import PanToolIcon from '@mui/icons-material/PanTool'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { getOptionalComponent } from '@etherealengine/ecs'
import { getComponent, hasComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { useState } from '@etherealengine/hyperflux'
import { CallbackComponent } from '@etherealengine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { TriggerComponent } from '@etherealengine/spatial/src/physics/components/TriggerComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'

import { NodeID, NodeIDComponent } from '@etherealengine/spatial/src/transform/components/NodeIDComponent'
import { Button } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, commitProperties, commitProperty, updateProperty } from './Util'

type OptionsType = Array<{
  callbacks: Array<{
    label: string
    value: string
  }>
  label: string
  value: NodeID | 'Self'
}>

const callbackQuery = defineQuery([CallbackComponent, NodeIDComponent])

export const TriggerComponentEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const targets = useState<OptionsType>([])

  const triggerComponent = useComponent(props.entity, TriggerComponent)

  useEffect(() => {
    const options = [] as OptionsType

    const entityCallbacks = getOptionalComponent(props.entity, CallbackComponent)
    if (entityCallbacks) {
      options.push({
        label: 'Self',
        value: getComponent(props.entity, NodeIDComponent),
        callbacks: Object.keys(entityCallbacks).map((cb) => {
          return { label: cb, value: cb }
        })
      })
    } else {
      options.push({
        label: 'Self',
        value: getComponent(props.entity, NodeIDComponent),
        callbacks: []
      })
    }

    for (const entity of callbackQuery()) {
      if (entity === props.entity || !hasComponent(entity, EntityTreeComponent)) continue
      const callbacks = getComponent(entity, CallbackComponent)
      options.push({
        label: getComponent(entity, NameComponent),
        value: getComponent(entity, NodeIDComponent),
        callbacks: Object.keys(callbacks).map((cb) => {
          return { label: cb, value: cb }
        })
      })
    }
    targets.set(options)
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.trigger.name')}
      description={t('editor:properties.trigger.description')}
    >
      <Button
        onClick={() => {
          const triggers = [
            ...triggerComponent.triggers.value,
            {
              target: 'Self',
              onEnter: '',
              onExit: ''
            }
          ]
          commitProperties(TriggerComponent, { triggers: JSON.parse(JSON.stringify(triggers)) }, [props.entity])
        }}
      >
        Add Trigger
      </Button>
      <div key={`trigger-list-${props.entity}`}>
        {triggerComponent.triggers.map((trigger, index) => {
          const targetOption = targets.value.find((o) => o.value === trigger.target.value)
          const target = targetOption ? targetOption.value : 'Self'
          return (
            <>
              <InputGroup name="Target" label={t('editor:properties.trigger.lbl-target')}>
                <SelectInput
                  key={props.entity}
                  value={trigger.target.value ?? 'Self'}
                  onChange={commitProperty(TriggerComponent, `triggers.${index}.target` as any)}
                  options={targets.value as OptionsType}
                  disabled={props.multiEdit}
                />
              </InputGroup>
              <InputGroup name="On Enter" label={t('editor:properties.trigger.lbl-onenter')}>
                {targetOption?.callbacks.length == 0 ? (
                  <StringInput
                    value={trigger.onEnter.value!}
                    onChange={updateProperty(TriggerComponent, `triggers.${index}.onEnter` as any)}
                    onRelease={commitProperty(TriggerComponent, `triggers.${index}.onEnter` as any)}
                    disabled={props.multiEdit || !target}
                  />
                ) : (
                  <SelectInput
                    key={props.entity}
                    value={trigger.onEnter.value!}
                    onChange={commitProperty(TriggerComponent, `triggers.${index}.onEnter` as any)}
                    options={
                      targetOption?.callbacks
                        ? (targetOption.callbacks as Array<{
                            label: string
                            value: string
                          }>)
                        : []
                    }
                    disabled={props.multiEdit || !target}
                  />
                )}
              </InputGroup>

              <InputGroup name="On Exit" label={t('editor:properties.trigger.lbl-onexit')}>
                {targetOption?.callbacks.length == 0 ? (
                  <StringInput
                    value={trigger.onExit.value!}
                    onRelease={updateProperty(TriggerComponent, `triggers.${index}.onExit` as any)}
                    onChange={commitProperty(TriggerComponent, `triggers.${index}.onExit` as any)}
                    disabled={props.multiEdit || !target}
                  />
                ) : (
                  <SelectInput
                    key={props.entity}
                    value={trigger.onExit.value!}
                    onChange={commitProperty(TriggerComponent, `triggers.${index}.onExit` as any)}
                    options={
                      targetOption?.callbacks
                        ? (targetOption.callbacks as Array<{
                            label: string
                            value: string
                          }>)
                        : []
                    }
                    disabled={props.multiEdit || !target}
                  />
                )}
              </InputGroup>
              <Button
                onClick={() => {
                  const triggers = [...triggerComponent.triggers.value]
                  triggers.splice(index, 1)
                  commitProperties(TriggerComponent, { triggers: JSON.parse(JSON.stringify(triggers)) }, [props.entity])
                }}
              >
                Remove
              </Button>
            </>
          )
        })}
      </div>
    </NodeEditor>
  )
}

TriggerComponentEditor.iconComponent = PanToolIcon

export default TriggerComponentEditor
