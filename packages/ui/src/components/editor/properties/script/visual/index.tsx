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

import { MdIntegrationInstructions } from 'react-icons/md'

import { EditorComponentType, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import { VisualScriptComponent } from '@ir-engine/engine'
import { BooleanInput } from '@ir-engine/ui/src/components/editor/input/Boolean'
import InputGroup from '../../../input/Group'
import { NodeEditor } from '../../nodeEditor'

export const VisualScriptNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const visualScriptComponent = useComponent(props.entity, VisualScriptComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.visualScript.name')}
      description={t('editor:properties.visualScript.description')}
      icon={<VisualScriptNodeEditor.iconComponent />}
    >
      <InputGroup
        name={t('editor:properties.visualScript.lbl-disabled')}
        label={t('editor:properties.visualScript.lbl-disabled')}
      >
        <BooleanInput
          value={visualScriptComponent.disabled.value}
          onChange={commitProperty(VisualScriptComponent, 'disabled')}
        />
      </InputGroup>
      <InputGroup
        name={t('editor:properties.visualScript.lbl-run')}
        label={t('editor:properties.visualScript.lbl-run')}
      >
        <BooleanInput value={visualScriptComponent.run.value} onChange={commitProperty(VisualScriptComponent, 'run')} />
      </InputGroup>
    </NodeEditor>
  )
}

VisualScriptNodeEditor.iconComponent = MdIntegrationInstructions

export default VisualScriptNodeEditor