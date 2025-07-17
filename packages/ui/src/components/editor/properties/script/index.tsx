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

import { IoLogoJavascript } from 'react-icons/io5'

import { EditorComponentType, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { updateScriptFile } from '@ir-engine/editor/src/panels/script'
import { ScriptComponent } from '@ir-engine/engine'
import { getEntityErrors } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import Button from '../../../../primitives/tailwind/Button'
import InputGroup from '../../input/Group'
import ScriptInput from '../../input/Script'

export const fetchCode = async (url) => {
  const response = await fetch(url)
  const text = await response.text()
  return text
}

export const createNewScriptFile = async () => {
  const fileName = `New File.tsx`
  const resolvedFileName = await updateScriptFile(fileName)
  return resolvedFileName.rawScript.url
}

export const ScriptNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const scriptComponent = useComponent(props.entity, ScriptComponent)

  const errors = getEntityErrors(props.entity, ScriptComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.script.name')}
      description={t('editor:properties.script.description')}
      Icon={ScriptNodeEditor.iconComponent}
    >
      <InputGroup
        name={t('editor:properties.script.lbl-scriptPath')}
        label={t('editor:properties.script.lbl-scriptPath')}
      >
        {!scriptComponent.src.value && (
          <Button onClick={() => createNewScriptFile().then(commitProperty(ScriptComponent, 'src'))}>
            {t('editor:properties.script.create')}
          </Button>
        )}
        <ScriptInput value={scriptComponent.src.value} onChange={commitProperty(ScriptComponent, 'src')} />
        {errors?.MISSING_FILE && (
          <div className="mt-0.5 text-red-700">{t('editor:properties.script.error.invalid-location')}</div>
        )}
        {errors?.INVALID_SCRIPT_TYPE && (
          <div className="mt-0.5 text-red-700">{t('editor:properties.script.error.invalid-type')}</div>
        )}
        {errors?.INVALID_URL_FORMAT && (
          <div className="mt-0.5 text-red-700">{t('editor:properties.script.error.invalid-format')}</div>
        )}
        {errors?.INVALID_URL_SCHEME && (
          <div className="mt-0.5 text-red-700">{t('editor:properties.script.error.invalid-schema')}</div>
        )}
      </InputGroup>
    </NodeEditor>
  )
}

ScriptNodeEditor.iconComponent = IoLogoJavascript

export default ScriptNodeEditor
