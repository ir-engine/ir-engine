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

import { UUIDComponent } from '@etherealengine/ecs'
import { getComponent, hasComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { PropertiesPanelButton } from '@etherealengine/editor/src/components/inputs/Button'
import InputGroup from '@etherealengine/editor/src/components/inputs/InputGroup'
import NumericInput from '@etherealengine/editor/src/components/inputs/NumericInput'
import SelectInput from '@etherealengine/editor/src/components/inputs/SelectInput'
import NodeEditor from '@etherealengine/editor/src/components/properties/NodeEditor'
import {
  EditorComponentType,
  commitProperties,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { useState } from '@etherealengine/hyperflux'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import PanToolIcon from '@mui/icons-material/PanTool'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { InputComponent } from '../components/InputComponent'

type OptionsType = Array<{
  label: string
  value: string
}>

const inputSinkQuery = defineQuery([SourceComponent]) //TODO confirm this is a good indicator of being in authoring layer

export const InputComponentNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const targets = useState<OptionsType>([{ label: 'Self', value: getComponent(props.entity, UUIDComponent) }])

  const inputComponent = useComponent(props.entity, InputComponent)

  console.log(inputComponent.inputSinks.value)
  useEffect(() => {
    const options = [] as OptionsType
    options.push({
      label: 'Self',
      value: getComponent(props.entity, UUIDComponent)
    })

    for (const entity of inputSinkQuery()) {
      if (entity === props.entity || !hasComponent(entity, EntityTreeComponent)) continue
      options.push({
        label: getComponent(entity, NameComponent),
        value: getComponent(entity, UUIDComponent)
      })
    }
    targets.set(options)
  }, [])

  const addSink = () => {
    const inputSinks = [
      ...inputComponent.inputSinks.value,
      {
        label: 'Self',
        value: getComponent(props.entity, UUIDComponent)
      }
    ]
    commitProperties(InputComponent, { inputSinks: JSON.parse(JSON.stringify(inputSinks)) }, [props.entity])
  }

  const removeSink = (index: number) => {
    const sinks = [...inputComponent.inputSinks.value]
    sinks.splice(index, 1)
    commitProperties(InputComponent, { inputSinks: JSON.parse(JSON.stringify(sinks)) }, [props.entity])
  }

  // const onChangeSinks = (index: number) => {
  //   if(inputComponent.inputSinks.value.length > 0)
  //
  // }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.input.name')}
      description={t('editor:properties.input.description')}
    >
      <InputGroup name="ActivationDistance" label={t('editor:properties.input.lbl-activationDistance')}>
        <NumericInput
          value={inputComponent.activationDistance.value}
          onChange={updateProperty(InputComponent, 'activationDistance')}
          onRelease={commitProperty(InputComponent, 'activationDistance')}
        />
      </InputGroup>

      <PropertiesPanelButton type="submit" onClick={addSink}>
        {t('editor:properties.input.lbl-addSinkTarget')}
      </PropertiesPanelButton>

      <div id={`inputSinks-list`}>
        {inputComponent.inputSinks.value.map((sink, index) => {
          return (
            <div key={index}>
              <InputGroup name="Target" label={t('editor:properties.input.lbl-target')}>
                <SelectInput
                  key={props.entity}
                  value={sink ?? 'Self'}
                  onChange={commitProperty(InputComponent, `inputSinks.${index}` as any)}
                  options={targets.value}
                  disabled={props.multiEdit}
                />
              </InputGroup>

              <PropertiesPanelButton type="submit" onClick={() => removeSink(index)}>
                {t('editor:properties.input.lbl-removeSinkTarget')}
              </PropertiesPanelButton>
            </div>
          )
        })}
      </div>
    </NodeEditor>
  )
}

InputComponentNodeEditor.iconComponent = PanToolIcon

export default InputComponentNodeEditor
