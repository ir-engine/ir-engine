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

import { UUIDComponent, defineQuery, getComponent, hasComponent, useComponent } from '@etherealengine/ecs'
import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { useHookstate } from '@etherealengine/hyperflux'
import { CallbackComponent } from '@etherealengine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { TriggerComponent } from '@etherealengine/spatial/src/physics/components/TriggerComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiPlus } from 'react-icons/hi2'
import { PiTrashSimple } from 'react-icons/pi'
import Select from '../../../../primitives/tailwind/Select'
import Text from '../../../../primitives/tailwind/Text'
import InputGroup from '../../input/Group'
import StringInput from '../../input/String'

type OptionsType = Array<{
  callbacks: Array<{
    label: string
    value: string
  }>
  label: string
  value: string
}>

const callbackQuery = defineQuery([CallbackComponent])

const TriggerProperties: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const targets = useHookstate<OptionsType>([{ label: 'Self', value: 'Self', callbacks: [] }])

  const triggerComponent = useComponent(props.entity, TriggerComponent)

  useEffect(() => {
    const options = [] as OptionsType
    options.push({
      label: 'Self',
      value: 'Self',
      callbacks: []
    })
    for (const entity of callbackQuery()) {
      if (entity === props.entity || !hasComponent(entity, EntityTreeComponent)) continue
      const callbacks = getComponent(entity, CallbackComponent)
      options.push({
        label: getComponent(entity, NameComponent),
        value: getComponent(entity, UUIDComponent),
        callbacks: Object.keys(callbacks).map((cb) => {
          return { label: cb, value: cb }
        })
      })
    }
    targets.set(options)
  }, [])

  return (
    <>
      <div className="mb-3 mt-5 flex items-center">
        <Text fontSize="xs" className="ml-12">
          {t('editor:properties.triggerVolume.name')}
        </Text>
        <div className="ml-auto mr-5 flex items-center gap-1">
          <HiPlus className="text-sm text-[#8B8B8D]" />
          <PiTrashSimple className="text-sm text-[#8B8B8D]" />
        </div>
      </div>
      <div className="w-full bg-[#1A1A1A]">
        {triggerComponent.triggers.map((trigger, index) => {
          const targetOption = targets.value.find((o) => o.value === trigger.target.value)
          const target = targetOption ? targetOption.value : 'Self'
          return (
            <>
              <InputGroup name="Target" label={t('editor:properties.triggerVolume.lbl-target')}>
                <Select
                  value={trigger.target.value ?? 'Self'}
                  onChange={commitProperty(TriggerComponent, `triggers.${index}.target` as any)}
                  options={targets.value}
                  disabled={props.multiEdit}
                />
              </InputGroup>
              <InputGroup name="On Enter" label={t('editor:properties.triggerVolume.lbl-onenter')}>
                {targetOption?.callbacks.length == 0 ? (
                  <StringInput
                    value={trigger.onEnter.value!}
                    onChange={updateProperty(TriggerComponent, `triggers.${index}.onEnter` as any)}
                    onRelease={commitProperty(TriggerComponent, `triggers.${index}.onEnter` as any)}
                    disabled={props.multiEdit || !target}
                  />
                ) : (
                  <Select
                    value={trigger.onEnter.value!}
                    onChange={commitProperty(TriggerComponent, `triggers.${index}.onEnter` as any)}
                    options={targetOption?.callbacks ? targetOption.callbacks : []}
                    disabled={props.multiEdit || !target}
                  />
                )}
              </InputGroup>

              <InputGroup name="On Exit" label={t('editor:properties.triggerVolume.lbl-onexit')}>
                {targetOption?.callbacks.length == 0 ? (
                  <StringInput
                    value={trigger.onExit.value!}
                    onRelease={updateProperty(TriggerComponent, `triggers.${index}.onExit` as any)}
                    onChange={commitProperty(TriggerComponent, `triggers.${index}.onExit` as any)}
                    disabled={props.multiEdit || !target}
                  />
                ) : (
                  <Select
                    value={trigger.onExit.value!}
                    onChange={commitProperty(TriggerComponent, `triggers.${index}.onExit` as any)}
                    options={targetOption?.callbacks ? targetOption.callbacks : []}
                    disabled={props.multiEdit || !target}
                  />
                )}
              </InputGroup>
            </>
          )
        })}
      </div>
    </>
  )
}

export default TriggerProperties
