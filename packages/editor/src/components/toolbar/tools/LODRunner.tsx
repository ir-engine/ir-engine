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

import React from 'react'

import Icon from '@etherealengine/ui/src/primitives/mui/Icon/index'

import { useTranslation } from 'react-i18next'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

import {
  DefaultModelTransformParameters,
  ModelTransformParameters
} from '@etherealengine/engine/src/assets/classes/ModelTransform'
import { transformModel as clientSideTransformModel } from '@etherealengine/engine/src/assets/compression/ModelTransformFunctions'
import { getFileName, pathResolver } from '@etherealengine/engine/src/assets/functions/pathResolver'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getComponent, hasComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createSceneEntity } from '@etherealengine/engine/src/ecs/functions/createSceneEntity'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { modelTransformPath } from '@etherealengine/engine/src/schemas/assets/model-transform.schema'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { useHookstate } from '@hookstate/core'
import { exportRelativeGLTF } from '../../../functions/exportGLTF'
import { EditorState } from '../../../services/EditorServices'
import { SelectionState } from '../../../services/SelectionServices'

const createLODS = async (modelSrc: string, modelFormat: 'glb' | 'gltf'): Promise<string[]> => {
  const transformParms: ModelTransformParameters = {
    ...DefaultModelTransformParameters,
    src: modelSrc,
    modelFormat
  }

  const batchCompressed = true
  const clientside = true
  const textureSizes = batchCompressed ? [2048, 1024, 512] : [transformParms.maxTextureSize]

  const variants: ModelTransformParameters[] = []
  const paths: string[] = []

  for (let index = 0; index < textureSizes.length; index++) {
    let nuPath = modelSrc.replace(/\.[^\.]+$/, '')
    if (batchCompressed) {
      nuPath += `-LOD_${index}`
    }
    nuPath += '.' + modelFormat
    const dst = getFileName(nuPath)
    variants.push({
      ...transformParms,
      maxTextureSize: textureSizes[index],
      dst
    })

    paths.push(nuPath)
  }

  for (const variant of variants) {
    if (clientside) {
      await clientSideTransformModel(variant)
    } else {
      await Engine.instance.api.service(modelTransformPath).create(variant)
    }
  }
  return paths
}

export const LODRunner = () => {
  const { t } = useTranslation()

  const titleText = 'LOD Runner'
  const tooltipText = 'Create LOD variants for selected model'

  const selectionState = useHookstate(getMutableState(SelectionState))

  async function createLODVariants() {
    const modelEntities = selectionState.selectedEntities.value.filter((entity) => hasComponent(entity, ModelComponent))

    const srcProject = getState(EditorState).projectName!

    for (const entity of modelEntities) {
      const modelComponent = getComponent(entity, ModelComponent)
      const modelSrc = modelComponent.src

      const relativePath = pathResolver()
        .exec(modelSrc)?.[2]
        .replace(/\.[^.]*$/, '')
      const modelFormat = modelSrc.endsWith('.gltf') ? 'gltf' : 'glb'

      const lodDevices = ['DESKTOP', 'XR', 'MOBILE']
      const lodPaths = await createLODS(modelSrc, modelFormat)
      const result = createSceneEntity('container')
      setComponent(result, ModelComponent)
      const variant = createSceneEntity('LOD Variant', result)
      setComponent(variant, ModelComponent)
      setComponent(variant, VariantComponent, {
        levels: lodPaths.map((src, index) => ({
          src,
          metadata: {
            device: lodDevices[index]
          }
        })),
        heuristic: 'DEVICE'
      })

      await exportRelativeGLTF(result, srcProject, `${relativePath}-lodded.${modelFormat}`)

      // change the source of the original model component
      // modelComponent.src.set(pathJoin(config.client.fileServer, 'projects', srcProject.value, fileName))
      //   see if that works
    }

    // const [_, directoryToRefresh, __] = /.*\/(projects\/.*)\/([\w\d\s\-_.]*)$/.exec(modelSrc)!
    // await FileBrowserService.fetchFiles(directoryToRefresh)
  }

  return (
    <>
      <div id="lod-runner" className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer}>
        <InfoTooltip title={titleText} info={tooltipText}>
          <button onClick={createLODVariants} className={styles.toolButton} style={{ background: 'orange' }}>
            <Icon type={'DirectionsRun'} fontSize="small" />
          </button>
        </InfoTooltip>
      </div>
    </>
  )
}

export default LODRunner
