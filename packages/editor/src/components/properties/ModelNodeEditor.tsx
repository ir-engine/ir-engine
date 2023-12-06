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

import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityErrors } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { getState, useState } from '@etherealengine/hyperflux'

import ViewInArIcon from '@mui/icons-material/ViewInAr'

import { ProjectState } from '@etherealengine/client-core/src/common/services/ProjectService'
import config from '@etherealengine/common/src/config'
import { pathJoin } from '@etherealengine/common/src/utils/miscUtils'
import { pathResolver } from '@etherealengine/engine/src/assets/functions/pathResolver'
import { exportRelativeGLTF } from '../../functions/exportGLTF'
import { EditorState } from '../../services/EditorServices'
import BooleanInput from '../inputs/BooleanInput'
import { PropertiesPanelButton } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import ModelInput from '../inputs/ModelInput'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import Well from '../layout/Well'
import ErrorPopUp from '../popup/ErrorPopUp'
import ModelTransformProperties from './ModelTransformProperties'
import NodeEditor from './NodeEditor'
import ScreenshareTargetNodeEditor from './ScreenshareTargetNodeEditor'
import { EditorComponentType, commitProperty } from './Util'

/**
 * ModelNodeEditor used to create editor view for the properties of ModelNode.
 *
 * @type {class component}
 */
export const ModelNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity
  const modelComponent = useComponent(entity, ModelComponent)
  const exporting = useState(false)
  const editorState = getState(EditorState)
  const projectState = getState(ProjectState)
  const loadedProjects = useState(() => projectState.projects.map((project) => project.name))
  const srcProject = useState(() => pathResolver().exec(modelComponent.src.value)?.[1] ?? editorState.projectName!)

  const getRelativePath = useCallback(() => {
    const relativePath = pathResolver().exec(modelComponent.src.value)?.[2]
    if (!relativePath) {
      return 'assets/new-model'
    } else {
      //return relativePath without file extension
      return relativePath.replace(/\.[^.]*$/, '')
    }
  }, [modelComponent.src])

  const getExportExtension = useCallback(() => {
    if (!modelComponent.src.value) return 'gltf'
    else return modelComponent.src.value.endsWith('.gltf') ? 'gltf' : 'glb'
  }, [modelComponent.src])

  const srcPath = useState(getRelativePath())

  const exportType = useState(getExportExtension())

  const errors = getEntityErrors(props.entity, ModelComponent)

  const onExportModel = () => {
    if (exporting.value) {
      console.warn('already exporting')
      return
    }
    exporting.set(true)
    const fileName = `${srcPath.value}.${exportType.value}`
    exportRelativeGLTF(entity, srcProject.value, fileName).then(() => {
      modelComponent.src.set(pathJoin(config.client.fileServer, 'projects', srcProject.value, fileName))
      exporting.set(false)
    })
  }

  useEffect(() => {
    srcPath.set(getRelativePath())
    exportType.set(getExportExtension())
  }, [modelComponent.src])

  return (
    <NodeEditor
      name={t('editor:properties.model.title')}
      description={t('editor:properties.model.description')}
      {...props}
    >
      <InputGroup name="Model Url" label={t('editor:properties.model.lbl-modelurl')}>
        <ModelInput value={modelComponent.src.value} onChange={commitProperty(ModelComponent, 'src')} />
        {errors?.LOADING_ERROR ||
          (errors?.INVALID_URL && ErrorPopUp({ message: t('editor:properties.model.error-url') }))}
      </InputGroup>
      <InputGroup name="Generate BVH" label={t('editor:properties.model.lbl-generateBVH')}>
        <BooleanInput
          value={modelComponent.generateBVH.value}
          onChange={commitProperty(ModelComponent, 'generateBVH')}
          disabled={modelComponent.hasSkinnedMesh.value}
        />
      </InputGroup>
      <InputGroup name="Avoid Camera Occlusion" label={t('editor:properties.model.lbl-avoidCameraOcclusion')}>
        <BooleanInput
          value={modelComponent.avoidCameraOcclusion.value}
          onChange={commitProperty(ModelComponent, 'avoidCameraOcclusion')}
        />
      </InputGroup>

      {!exporting.value && (
        <Well>
          <div className="property-group-header">{t('editor:properties.model.lbl-export')}</div>
          <InputGroup name="Export Project" label="Project">
            <SelectInput
              value={srcProject.value}
              options={
                loadedProjects.value.map((project) => ({
                  label: project,
                  value: project
                })) ?? []
              }
              onChange={srcProject.set}
            />
          </InputGroup>
          <InputGroup name="File Path" label="File Path">
            <StringInput value={srcPath.value} onChange={(e) => srcPath.set(e.target.value)} />
          </InputGroup>
          <InputGroup name="Export Type" label={t('editor:properties.model.lbl-exportType')}>
            <SelectInput<string>
              options={[
                {
                  label: 'glB',
                  value: 'glb'
                },
                {
                  label: 'glTF',
                  value: 'gltf'
                }
              ]}
              value={exportType.value}
              onChange={exportType.set}
            />
          </InputGroup>
          <PropertiesPanelButton onClick={onExportModel}>Save Changes</PropertiesPanelButton>
        </Well>
      )}
      {exporting.value && <p>Exporting...</p>}
      <ScreenshareTargetNodeEditor entity={props.entity} multiEdit={props.multiEdit} />
      <ModelTransformProperties entity={entity} onChangeModel={commitProperty(ModelComponent, 'src')} />
    </NodeEditor>
  )
}

ModelNodeEditor.iconComponent = ViewInArIcon

export default ModelNodeEditor
