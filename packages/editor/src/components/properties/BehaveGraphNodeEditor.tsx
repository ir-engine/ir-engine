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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { BehaveGraphComponent } from '@etherealengine/engine/src/behave-graph/components/BehaveGraphComponent'
import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'

import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions'

import { uploadToFeathersService } from '@etherealengine/client-core/src/util/upload'
import config from '@etherealengine/common/src/config'
import { processFileName } from '@etherealengine/common/src/utils/processFileName'
import { cleanStorageProviderURLs } from '@etherealengine/engine/src/common/functions/parseSceneJSON'
import { NO_PROXY, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { uniqueId } from 'lodash'
import { getFileName } from '../../../../engine/src/assets/functions/pathResolver'
import { EditorState } from '../../services/EditorServices'
import BooleanInput from '../inputs/BooleanInput'
import GraphInput from '../inputs/GraphInput'
import InputGroup from '../inputs/InputGroup'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 *
 * AmbientLightNodeEditor component used to customize the ambient light element on the scene
 * ambient light is basically used to illuminates all the objects present inside the scene.
 *
 * @type {[component class]}
 */
export const BehaveGraphNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const behaveGraphComponent = useComponent(props.entity, BehaveGraphComponent)
  const editorState = useHookstate(getMutableState(EditorState))

  useEffect(() => {
    const relativePath = `projects/${editorState.projectName.value}/assets/graphs`
    const fileName = `${uniqueId(`${editorState.sceneName.value}Graph`)}.graph.json`
    const data = cleanStorageProviderURLs(JSON.parse(JSON.stringify(behaveGraphComponent.graph.get(NO_PROXY))))
    const blob = new Blob([JSON.stringify(data)], { type: 'json' })
    const file = new File([blob], getFileName(behaveGraphComponent.filepath.value), { type: 'json' })

    ;(async () => {
      console.log('DEBUG uploading file', file, relativePath)
      await uploadToFeathersService('file-browser/upload', [file], {
        fileName: processFileName(file.name),
        path: relativePath,
        contentType: file.type
      }).promise
      console.log('DEBUG Uploaded file')
      behaveGraphComponent.filepath.set(`${config.client.fileServer}/${relativePath}/${fileName}`)
    })()
  }, [])
  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.graph.name')}
      description={t('editor:properties.graph.description')}
    >
      <InputGroup name="Graph Url" label={t('editor:properties.graph.lbl-graphURL')}>
        <GraphInput
          value={behaveGraphComponent.filepath.value}
          onChange={updateProperty(BehaveGraphComponent, 'filepath')}
        />
      </InputGroup>
      <InputGroup name="Disable Graph" label={t('editor:properties.graph.lbl-disableGraph')}>
        <BooleanInput
          value={behaveGraphComponent.disabled.value}
          onChange={updateProperty(BehaveGraphComponent, 'disabled')}
        />
      </InputGroup>
      <InputGroup name="Play Graph" label={t('editor:properties.image.lbl-playGraph')}>
        <BooleanInput value={behaveGraphComponent.run.value} onChange={updateProperty(BehaveGraphComponent, 'run')} />
      </InputGroup>
    </NodeEditor>
  )
}

BehaveGraphNodeEditor.iconComponent = IntegrationInstructionsIcon

export default BehaveGraphNodeEditor
