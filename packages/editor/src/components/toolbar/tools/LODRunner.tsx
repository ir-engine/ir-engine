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

import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { getComponent, hasComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getMutableState } from '@etherealengine/hyperflux'
import { useHookstate } from '@hookstate/core'
import { SelectionState } from '../../../services/SelectionServices'

import {
  DefaultModelTransformParameters,
  ModelTransformParameters
} from '@etherealengine/engine/src/assets/classes/ModelTransform'
import { transformModel as clientSideTransformModel } from '@etherealengine/engine/src/assets/compression/ModelTransformFunctions'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { modelTransformPath } from '@etherealengine/engine/src/schemas/assets/model-transform.schema'

const createSceneEntity = (name: string, parentEntity: Entity | null = null): Entity => {
  const entity = createEntity()
  setComponent(entity, NameComponent, name)
  setComponent(entity, VisibleComponent)
  setComponent(entity, TransformComponent)
  setComponent(entity, EntityTreeComponent, { parentEntity })
  return entity
}

const createLODS = async (modelEntity: Entity): Promise<string[]> => {
  const model = getComponent(modelEntity, ModelComponent)
  const modelSrc = model.src
  const transformParms: ModelTransformParameters = {
    ...DefaultModelTransformParameters,
    src: modelSrc,
    modelFormat: modelSrc.endsWith('.gltf') ? 'gltf' : 'glb'
  }

  const batchCompressed = true
  const clientside = true
  const textureSizes = batchCompressed ? [2048, 1024, 512] : [transformParms.maxTextureSize]

  const variants: ModelTransformParameters[] = []
  const paths: string[] = []

  for (let index = 0; index < textureSizes.length; index++) {
    const suffix = batchCompressed ? `-transformed-LOD_${index}.glb` : '-transformed.glb'
    const nuPath = modelSrc.replace(/(-transformed)?\.glb$/, suffix)
    const [_, __, dst] = /.*\/(projects\/.*)\/([\w\d\s\-_.]*)$/.exec(nuPath)!
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

    for (const entity of modelEntities) {
      const lodPaths = await createLODS(entity)
      const result = createSceneEntity('container')
      setComponent(result, ModelComponent)
      const variant = createSceneEntity('LOD Variant', result)
      setComponent(variant, ModelComponent)
      setComponent(variant, VariantComponent, {
        levels: lodPaths.map((src) => ({
          src,
          metadata: {}
        })),
        heuristic: 'DEVICE'
      })

      // run exportRelativeGLTF on parent
      // change the source of the original model component
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
