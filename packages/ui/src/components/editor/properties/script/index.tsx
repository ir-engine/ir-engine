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

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { IoLogoJavascript } from 'react-icons/io5'

import { uploadToFeathersService } from '@ir-engine/client-core/src/util/upload'
import config from '@ir-engine/common/src/config'
import { fileBrowserUploadPath } from '@ir-engine/common/src/schema.type.module'
import { EditorComponentType, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { ScriptComponent } from '@ir-engine/engine'
import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { BooleanInput } from '@ir-engine/ui/src/components/editor/input/Boolean'
import { uniqueId } from 'lodash'
import InputGroup from '../../input/Group'
import ScriptInput from '../../input/Script'
import { NodeEditor } from '../nodeEditor'

export const updateScriptFile = async (fileName, script = 'hello world') => {
  const file = new File([script], fileName, { type: ItemTypes.Scripts[3] })
  await uploadToFeathersService(fileBrowserUploadPath, [file], {
    args: [
      {
        project: getState(EditorState).projectName,
        path: 'assets/scripts/' + fileName,
        contentType: file.type
      }
    ]
  }).promise
  return
}

export const ScriptNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const scriptComponent = useComponent(props.entity, ScriptComponent)

  const editorState = useHookstate(getMutableState(EditorState))

  useEffect(() => {
    if (scriptComponent.src.value.length > 0) return // only set if there is no value already set

    const relativePath = `projects/${editorState.projectName.value}/assets/scripts`
    const fileName = `${uniqueId(`${editorState.sceneName.value}RealityScript`)}.js`
    ;(async () => {
      // create emtpty or defualt script file
      await updateScriptFile(fileName)
      scriptComponent.src.set(`${config.client.fileServer}/${relativePath}/${fileName}`)
      commitProperty(ScriptComponent, 'src')(scriptComponent.src.value)
    })()
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.script.name')}
      description={t('editor:properties.script.description')}
      icon={<ScriptNodeEditor.iconComponent />}
    >
      <InputGroup name={t('editor:properties.script.lbl-disabled')} label={t('editor:properties.script.lbl-disabled')}>
        <BooleanInput value={scriptComponent.disabled.value} onChange={commitProperty(ScriptComponent, 'disabled')} />
      </InputGroup>
      <InputGroup
        name={t('editor:properties.script.lbl-scriptPath')}
        label={t('editor:properties.script.lbl-scriptPath')}
      >
        <ScriptInput value={scriptComponent.src.value} onChange={commitProperty(ScriptComponent, 'src')} />
      </InputGroup>
      <InputGroup name={t('editor:properties.script.lbl-async')} label={t('editor:properties.script.lbl-async')}>
        <BooleanInput value={scriptComponent.async.value} onChange={commitProperty(ScriptComponent, 'async')} />
      </InputGroup>

      <InputGroup name={t('editor:properties.script.lbl-run')} label={t('editor:properties.script.lbl-run')}>
        <BooleanInput value={scriptComponent.run.value} onChange={commitProperty(ScriptComponent, 'run')} />
      </InputGroup>
    </NodeEditor>
  )
}

ScriptNodeEditor.iconComponent = IoLogoJavascript

export default ScriptNodeEditor
