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

import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityErrors } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { useHookstate } from '@etherealengine/hyperflux'

import ViewInArIcon from '@mui/icons-material/ViewInAr'

import exportGLTF from '../../functions/exportGLTF'
import BooleanInput from '../inputs/BooleanInput'
import { PropertiesPanelButton } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import ModelInput from '../inputs/ModelInput'
import SelectInput from '../inputs/SelectInput'
import Well from '../layout/Well'
import ModelTransformProperties from './ModelTransformProperties'
import NodeEditor from './NodeEditor'
import ScreenshareTargetNodeEditor from './ScreenshareTargetNodeEditor'
import ShadowProperties from './ShadowProperties'
import { EditorComponentType, updateProperty } from './Util'

/**
 * ModelNodeEditor used to create editor view for the properties of ModelNode.
 *
 * @type {class component}
 */
export const ModelNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity
  const modelComponent = useComponent(entity, ModelComponent)
  const exporting = useHookstate(false)

  const exportPath = useHookstate(() => modelComponent.src.value)
  const exportType = useHookstate(modelComponent.src.value.endsWith('.gltf') ? 'gltf' : 'glb')

  const errors = getEntityErrors(props.entity, ModelComponent)

  const onChangeExportPath = useCallback(
    (path: string) => {
      let finalPath = path
      if (finalPath.endsWith('.gltf')) {
        exportType.set('gltf')
      } else if (path.endsWith('.glb')) {
        exportType.set('glb')
      } else {
        finalPath = `${finalPath}.${exportType.value}`
      }
      exportPath.set(finalPath)
    },
    [exportType, exportPath]
  )

  const onChangeExportType = useCallback(
    (type: string) => {
      const finalPath = exportPath.value.replace(/\.[^.]*$/, `.${type}`)
      exportPath.set(finalPath)
      exportType.set(type)
    },
    [exportPath, exportType]
  )

  const onExportModel = useCallback(() => {
    if (exporting.value) {
      console.warn('already exporting')
      return
    }
    exporting.set(true)
    exportGLTF(entity, exportPath.value).then(() => exporting.set(false))
  }, [])

  const updateResources = useCallback((path: string) => {
    updateProperty(ModelComponent, 'src')(path)
  }, [])

  return (
    <NodeEditor
      name={t('editor:properties.model.title')}
      description={t('editor:properties.model.description')}
      {...props}
    >
      <InputGroup name="Model Url" label={t('editor:properties.model.lbl-modelurl')}>
        <ModelInput value={modelComponent.src.value} onChange={updateResources} />
        {errors?.LOADING_ERROR && (
          <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.model.error-url')}</div>
        )}
      </InputGroup>
      <InputGroup name="Generate BVH" label={t('editor:properties.model.lbl-generateBVH')}>
        <BooleanInput
          value={modelComponent.generateBVH.value}
          onChange={updateProperty(ModelComponent, 'generateBVH')}
        />
      </InputGroup>
      <InputGroup name="Avoid Camera Occlusion" label={t('editor:properties.model.lbl-avoidCameraOcclusion')}>
        <BooleanInput
          value={modelComponent.avoidCameraOcclusion.value}
          onChange={updateProperty(ModelComponent, 'avoidCameraOcclusion')}
        />
      </InputGroup>
      <ScreenshareTargetNodeEditor entity={props.entity} multiEdit={props.multiEdit} />
      <ShadowProperties entity={props.entity} />
      <ModelTransformProperties modelState={modelComponent} onChangeModel={(val) => modelComponent.src.set(val)} />
      {!exporting.value && modelComponent.src.value && (
        <Well>
          <ModelInput value={exportPath.value} onChange={onChangeExportPath} />
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
              onChange={onChangeExportType}
            />
          </InputGroup>
          <PropertiesPanelButton onClick={onExportModel}>Save Changes</PropertiesPanelButton>
        </Well>
      )}
      {exporting.value && <p>Exporting...</p>}
    </NodeEditor>
  )
}

ModelNodeEditor.iconComponent = ViewInArIcon

export default ModelNodeEditor
