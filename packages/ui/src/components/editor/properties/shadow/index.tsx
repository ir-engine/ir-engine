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
import { FaClone } from 'react-icons/fa6'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'

import { EditorComponentType, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { Checkbox } from '@ir-engine/ui'
import InputGroup from '../../input/Group'

/**
 * ShadowProperties used to create editor view for the properties of ModelNode.
 */
export const ShadowNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const shadowComponent = useComponent(props.entity, ShadowComponent)
  return (
    <NodeEditor
      name={t('editor:properties.shadow.name')}
      component={ShadowComponent}
      description={t('editor:properties.shadow.description')}
      Icon={ShadowNodeEditor.iconComponent}
      {...props}
    >
      <InputGroup name="Cast Shadow" label={t('editor:properties.shadow.lbl-castShadow')}>
        <Checkbox checked={shadowComponent.cast.value} onChange={commitProperty(ShadowComponent, 'cast')} />
      </InputGroup>
      <InputGroup name="Receive Shadow" label={t('editor:properties.shadow.lbl-receiveShadow')}>
        <Checkbox checked={shadowComponent.receive.value} onChange={commitProperty(ShadowComponent, 'receive')} />
      </InputGroup>
    </NodeEditor>
  )
}

ShadowNodeEditor.iconComponent = FaClone
export default ShadowNodeEditor
