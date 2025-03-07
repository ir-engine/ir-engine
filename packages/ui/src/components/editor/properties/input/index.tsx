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

import { useQuery, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import {
  commitProperties,
  commitProperty,
  EditorComponentType,
  updateProperty
} from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlinePanTool } from 'react-icons/md'
import Button from '../../../../primitives/tailwind/Button'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'

export const InputComponentNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const inputComponent = useComponent(props.entity, InputComponent)
  const authoringLayerEntities = useQuery([SourceComponent])

  const options = authoringLayerEntities.map((entity) => {
    return {
      label: getComponent(entity, NameComponent),
      value: getComponent(entity, UUIDComponent)
    }
  })
  options.unshift({
    label: 'Self',
    value: getComponent(props.entity, UUIDComponent)
  })

  const addSink = () => {
    const sinks = [...(inputComponent.inputSinks.value ?? []), getComponent(props.entity, UUIDComponent)]

    if (!EditorControlFunctions.hasComponentInAuthoringLayer(props.entity, InputComponent)) {
      EditorControlFunctions.addOrRemoveComponent([props.entity], InputComponent, true, {
        inputSinks: JSON.parse(JSON.stringify(sinks))
      })
    } else {
      commitProperties(InputComponent, { inputSinks: JSON.parse(JSON.stringify(sinks)) }, [props.entity])
    }
  }

  const removeSink = (index: number) => {
    const sinks = [...inputComponent.inputSinks.value]
    sinks.splice(index, 1)
    commitProperties(InputComponent, { inputSinks: JSON.parse(JSON.stringify(sinks)) }, [props.entity])
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.input.name')}
      description={t('editor:properties.input.description')}
      Icon={InputComponentNodeEditor.iconComponent}
    >
      <InputGroup
        name="ActivationDistance"
        label={t('editor:properties.input.lbl-activationDistance')}
        info={t('editor:properties.input.info-activationDistance')}
      >
        <NumericInput
          value={inputComponent.activationDistance.value}
          onChange={updateProperty(InputComponent, 'activationDistance')}
          onRelease={commitProperty(InputComponent, 'activationDistance')}
        />
      </InputGroup>
      <div className="flex w-full flex-1 justify-center">
        <Button variant="tertiary" onClick={addSink}>
          {t('editor:properties.input.lbl-addSinkTarget')}
        </Button>
      </div>
      <div id={`inputSinks-list`}>
        {options.length > 1 && inputComponent.inputSinks.value?.length > 0
          ? inputComponent.inputSinks.value.map((sink, index) => {
              return (
                <div key={index}>
                  <InputGroup name="Target" label={t('editor:properties.input.lbl-sinkTarget')}>
                    <SelectInput
                      key={props.entity}
                      value={sink ?? 'Self'}
                      onChange={commitProperty(InputComponent, `inputSinks.${index}` as any)}
                      options={options}
                      disabled={props.multiEdit}
                    />
                  </InputGroup>
                  <div className="flex w-full flex-1 justify-center">
                    <Button variant="tertiary" onClick={() => removeSink(index)}>
                      {t('editor:properties.input.lbl-removeSinkTarget')}
                    </Button>
                  </div>
                </div>
              )
            })
          : null}
      </div>
    </NodeEditor>
  )
}

InputComponentNodeEditor.iconComponent = MdOutlinePanTool

export default InputComponentNodeEditor
