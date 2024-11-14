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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlinePanTool } from 'react-icons/md'

import { getOptionalComponent, useQuery, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, hasComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import {
  commitProperties,
  commitProperty,
  EditorComponentType,
  updateProperty
} from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import {
  InteractableComponent,
  XRUIActivationType
} from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { useHookstate } from '@ir-engine/hyperflux'
import { CallbackComponent } from '@ir-engine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { Checkbox } from '@ir-engine/ui'
import Button from '../../../../primitives/tailwind/Button'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import StringInput from '../../input/String'

type OptionsType = Array<{
  callbacks: Array<{
    label: string
    value: string
  }>
  label: string
  value: string
}>

export const InteractableComponentNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const targets = useHookstate<OptionsType>([
    { label: 'Self', value: getComponent(props.entity, UUIDComponent), callbacks: [] }
  ])
  const callbackQuery = useQuery([CallbackComponent])

  const interactableComponent = useComponent(props.entity, InteractableComponent)

  useEffect(() => {
    const options = [] as OptionsType

    if (!hasComponent(props.entity, InputComponent)) {
      EditorControlFunctions.addOrRemoveComponent([props.entity], InputComponent, true)
    }

    const entityCallbacks = getOptionalComponent(props.entity, CallbackComponent)
    if (entityCallbacks) {
      options.push({
        label: 'Self',
        value: getComponent(props.entity, UUIDComponent),
        callbacks: Object.keys(entityCallbacks).map((cb) => {
          return { label: cb, value: cb }
        })
      })
    } else {
      options.push({
        label: 'Self',
        value: 'Self',
        callbacks: []
      })
    }
    for (const entity of callbackQuery) {
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
  }, [JSON.stringify(callbackQuery)])

  const updateLabel = (value: string) => {
    commitProperty(InteractableComponent, 'label')(value)
    //this might be useful later, but xrui is not updating properly
    // const msg = value ?? ''
    // modalState.interactMessage?.set(msg)
  }
  const addCallback = () => {
    const label = ''
    const callbacks = [
      ...interactableComponent.callbacks.value,
      {
        target: 'Self',
        callbackID: ''
      }
    ]
    commitProperties(InteractableComponent, { label: label, callbacks: JSON.parse(JSON.stringify(callbacks)) }, [
      props.entity
    ])
  }
  const removeCallback = (index: number) => {
    const callbacks = [...interactableComponent.callbacks.value]
    callbacks.splice(index, 1)
    commitProperties(InteractableComponent, { callbacks: JSON.parse(JSON.stringify(callbacks)) }, [props.entity])
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.interactable.name')}
      description={t('editor:properties.interactable.description')}
      Icon={InteractableComponentNodeEditor.iconComponent}
    >
      <InputGroup name="Label" label={t('editor:properties.interactable.lbl-label')}>
        <StringInput
          value={interactableComponent.label.value!}
          onChange={updateProperty(InteractableComponent, 'label')}
          onRelease={(value) => updateLabel(value)}
        />
      </InputGroup>

      <InputGroup name="activationType" label="Activation Type">
        <SelectInput
          key={props.entity}
          value={interactableComponent.uiActivationType.value}
          options={[
            { label: 'Hover', value: XRUIActivationType.hover },
            { label: 'Proximity', value: XRUIActivationType.proximity }
          ]}
          onChange={commitProperty(InteractableComponent, `uiActivationType`)}
        />
      </InputGroup>

      {interactableComponent.uiActivationType.value == XRUIActivationType.proximity && (
        <InputGroup
          name="ActivationDistance"
          label={t('editor:properties.interactable.lbl-UIactivationDistance')}
          info={t('editor:properties.interactable.info-UIactivationDistance')}
        >
          <NumericInput
            value={interactableComponent.activationDistance.value}
            onChange={updateProperty(InteractableComponent, 'activationDistance')}
            onRelease={commitProperty(InteractableComponent, 'activationDistance')}
          />
        </InputGroup>
      )}

      {interactableComponent.uiActivationType.value == XRUIActivationType.proximity && (
        <InputGroup
          name="ClickInteract"
          label={t('editor:properties.interactable.lbl-clickInteract')}
          info={t('editor:properties.interactable.info-clickInteract')}
        >
          <Checkbox
            checked={interactableComponent.clickInteract.value}
            onChange={commitProperty(InteractableComponent, 'clickInteract')}
          />
        </InputGroup>
      )}

      <Button className="self-end" onClick={addCallback}>
        {t('editor:properties.interactable.lbl-addcallback')}
      </Button>

      <div id={`callback-list`}>
        {interactableComponent.callbacks.map((callback, index) => {
          const targetOption = targets.value.find((o) => o.value === callback.target.value)
          const target = targetOption ? targetOption.value : 'Self'
          return (
            <div key={'callback' + index} className="space-y-2">
              <InputGroup name="Target" label={t('editor:properties.interactable.callbacks.lbl-target')}>
                <SelectInput
                  key={props.entity}
                  value={callback.target.value ?? 'Self'}
                  onChange={commitProperty(InteractableComponent, `callbacks.${index}.target` as any)}
                  options={targets.value as OptionsType}
                  disabled={props.multiEdit}
                />
              </InputGroup>

              <InputGroup name="CallbackID" label={t('editor:properties.interactable.callbacks.lbl-callbackID')}>
                {targetOption?.callbacks.length == 0 ? (
                  <StringInput
                    value={callback.callbackID.value!}
                    onChange={updateProperty(InteractableComponent, `callbacks.${index}.callbackID` as any)}
                    onRelease={commitProperty(InteractableComponent, `callbacks.${index}.callbackID` as any)}
                    disabled={props.multiEdit || !target}
                  />
                ) : (
                  <SelectInput
                    key={props.entity}
                    value={callback.callbackID.value!}
                    onChange={commitProperty(InteractableComponent, `callbacks.${index}.callbackID` as any)}
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

              <div className="flex justify-end">
                <Button onClick={() => removeCallback(index)}>
                  {t('editor:properties.interactable.lbl-removecallback')}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </NodeEditor>
  )
}

InteractableComponentNodeEditor.iconComponent = MdOutlinePanTool

export default InteractableComponentNodeEditor
