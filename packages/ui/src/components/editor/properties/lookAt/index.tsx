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

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { FaRegFaceFlushed } from 'react-icons/fa6'

import { EntityUUID } from '@ir-engine/ecs'
import { EditorComponentType, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { LookAtComponent } from '@ir-engine/spatial/src/transform/components/LookAtComponent'
import { Checkbox } from '@ir-engine/ui'
import InputGroup from '../../input/Group'
import NodeInput from '../../input/Node'

/**
 * FacerNodeEditor component used to customize the facer element on the scene
 */
export const LookAtNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const lookAtComponent = useComponent(props.entity, LookAtComponent)

  return (
    <NodeEditor
      entity={props.entity}
      component={LookAtComponent}
      name={t('editor:properties.lookAt.name')}
      description={t('editor:properties.lookAt.description')}
      Icon={LookAtNodeEditor.iconComponent}
    >
      <InputGroup name="Target" label={t('editor:properties.lookAt.target')}>
        <NodeInput
          value={lookAtComponent.target.value ?? ('' as EntityUUID)}
          onRelease={commitProperty(LookAtComponent, 'target')}
          onChange={commitProperty(LookAtComponent, 'target')}
        />
      </InputGroup>
      <InputGroup name="X Axis" label={t('editor:properties.lookAt.xAxis')}>
        <Checkbox checked={lookAtComponent.xAxis.value} onChange={commitProperty(LookAtComponent, 'xAxis')} />
      </InputGroup>
      <InputGroup name="Y Axis" label={t('editor:properties.lookAt.yAxis')}>
        <Checkbox checked={lookAtComponent.yAxis.value} onChange={commitProperty(LookAtComponent, 'yAxis')} />
      </InputGroup>
    </NodeEditor>
  )
}

LookAtNodeEditor.iconComponent = FaRegFaceFlushed

export default LookAtNodeEditor
