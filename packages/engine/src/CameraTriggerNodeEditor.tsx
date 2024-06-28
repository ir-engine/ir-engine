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

import { defineQuery, useQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { CallbackComponent } from '@etherealengine/spatial/src/common/CallbackComponent'

import { UUIDComponent, getComponent, useComponent } from '@etherealengine/ecs'
import InputGroup from '@etherealengine/editor/src/components/inputs/InputGroup'
import NumericInput from '@etherealengine/editor/src/components/inputs/NumericInput'
import SelectInput from '@etherealengine/editor/src/components/inputs/SelectInput'
import Vector3Input from '@etherealengine/editor/src/components/inputs/Vector3Input'
import { NodeEditor } from '@etherealengine/editor/src/components/properties/NodeEditor'
import { EditorComponentType, commitProperty } from '@etherealengine/editor/src/components/properties/Util'
import { TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { CameraTriggerComponent } from './CameraTriggerComponent'

const callbackQuery = defineQuery([CallbackComponent])

export const CameraTriggerNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const component = useComponent(props.entity, CameraTriggerComponent)

  const availableTransforms = useQuery([TransformComponent]).map((entity) => {
    const name = getComponent(entity, NameComponent)
    const uuid = getComponent(entity, UUIDComponent)
    return {
      label: name,
      value: uuid
    }
  })

  useEffect(() => {}, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.cameraTrigger.name')}
      description={t('editor:properties.cameraTrigger.description')}
    >
      <InputGroup name="LookAtEntity" label={t('editor:properties.cameraTrigger.lbl-lookAt')}>
        <SelectInput
          key={props.entity}
          options={availableTransforms}
          value={component.lookAtEntityUUID.value!}
          onChange={commitProperty(CameraTriggerComponent, 'lookAtEntityUUID') as any}
        />
      </InputGroup>
      <InputGroup name="OffsetEntity" label={t('editor:properties.cameraTrigger.lbl-offset')}>
        <Vector3Input value={component.offset.value} onChange={commitProperty(CameraTriggerComponent, 'offset')} />
      </InputGroup>
      <InputGroup name="ThetaAngle" label={t('editor:properties.cameraTrigger.lbl-angleTheta')}>
        <NumericInput value={component.theta.value} onChange={(val: number) => component.theta.set(val)} />
      </InputGroup>
      <InputGroup name="PhiAngle" label={t('editor:properties.cameraTrigger.lbl-anglePhi')}>
        <NumericInput value={component.phi.value} onChange={(val: number) => component.phi.set(val)} />
      </InputGroup>
      <InputGroup name="Distance" label={t('editor:properties.cameraTrigger.lbl-distance')}>
        <NumericInput value={component.distance.value} onChange={(val: number) => component.distance.set(val)} />
      </InputGroup>
      <InputGroup name="EnterLerpDuration" label={t('editor:properties.cameraTrigger.lbl-lerpDurationEnter')}>
        <NumericInput
          value={component.enterLerpDuration.value}
          onChange={(val: number) => component.enterLerpDuration.set(val)}
        />
      </InputGroup>
    </NodeEditor>
  )
}

CameraTriggerNodeEditor.iconComponent = PanToolIcon

export default CameraTriggerNodeEditor
