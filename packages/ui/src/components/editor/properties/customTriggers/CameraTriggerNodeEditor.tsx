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

import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { CallbackComponent } from '@etherealengine/spatial/src/common/CallbackComponent'

import { EntityUUID, hasComponent, useComponent } from '@etherealengine/ecs'

import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { SelectionState } from '@etherealengine/editor/src/services/SelectionServices'
import { CameraTriggerComponent } from '@etherealengine/engine/src/CameraTriggerComponent'
import { TriggerComponent } from '@etherealengine/spatial/src/physics/components/TriggerComponent'
import { NodeInput } from '@etherealengine/ui/src/components/editor/input/Node/index'
import BooleanInput from '../../input/Boolean'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import Vector3Input from '../../input/Vector3'
import NodeEditor from '../nodeEditor'

const callbackQuery = defineQuery([CallbackComponent])

export const CameraTriggerNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const component = useComponent(props.entity, CameraTriggerComponent)

  useEffect(() => {
    if (!hasComponent(props.entity, TriggerComponent)) {
      const nodes = SelectionState.getSelectedEntities()
      EditorControlFunctions.addOrRemoveComponent(nodes, TriggerComponent, true)
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.cameraTrigger.name')}
      description={t('editor:properties.cameraTrigger.description')}
    >
      <InputGroup name="LookAtEntity" label={t('editor:properties.cameraTrigger.lbl-lookAt')}>
        <NodeInput
          value={component.lookAtEntityUUID.value ?? ('' as EntityUUID)}
          onRelease={commitProperty(CameraTriggerComponent, 'lookAtEntityUUID')}
          onChange={commitProperty(CameraTriggerComponent, 'lookAtEntityUUID')}
        />
      </InputGroup>
      <InputGroup name="OffsetEntity" label={t('editor:properties.cameraTrigger.lbl-offset')}>
        <Vector3Input
          value={component.offset.value}
          onChange={updateProperty(CameraTriggerComponent, 'offset')}
          onRelease={commitProperty(CameraTriggerComponent, 'offset')}
        />
      </InputGroup>
      <InputGroup name="ThetaAngle" label={t('editor:properties.cameraTrigger.lbl-angleTheta')}>
        <NumericInput
          value={component.theta.value}
          onChange={updateProperty(CameraTriggerComponent, 'theta')}
          onRelease={commitProperty(CameraTriggerComponent, 'theta')}
        />
      </InputGroup>
      <InputGroup name="PhiAngle" label={t('editor:properties.cameraTrigger.lbl-anglePhi')}>
        <NumericInput
          value={component.phi.value}
          onChange={updateProperty(CameraTriggerComponent, 'phi')}
          onRelease={commitProperty(CameraTriggerComponent, 'phi')}
        />
      </InputGroup>
      <InputGroup name="Distance" label={t('editor:properties.cameraTrigger.lbl-distance')}>
        <NumericInput
          value={component.distance.value}
          onChange={updateProperty(CameraTriggerComponent, 'distance')}
          onRelease={commitProperty(CameraTriggerComponent, 'distance')}
        />
      </InputGroup>
      <InputGroup name="EnterLerpDuration" label={t('editor:properties.cameraTrigger.lbl-lerpDurationEnter')}>
        <NumericInput
          value={component.enterLerpDuration.value}
          onChange={updateProperty(CameraTriggerComponent, 'enterLerpDuration')}
          onRelease={commitProperty(CameraTriggerComponent, 'enterLerpDuration')}
        />
      </InputGroup>
      <InputGroup name="HideAvatar" label={t('editor:properties.cameraTrigger.lbl-hideAvatar')}>
        <BooleanInput
          value={component.hideAvatar.value}
          onChange={commitProperty(CameraTriggerComponent, 'hideAvatar')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

CameraTriggerNodeEditor.iconComponent = PanToolIcon

export default CameraTriggerNodeEditor
