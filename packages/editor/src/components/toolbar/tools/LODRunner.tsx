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

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import {
  DefaultModelTransformParameters,
  ModelTransformParameters
} from '@etherealengine/engine/src/assets/classes/ModelTransform'
import { transformModel as clientSideTransformModel } from '@etherealengine/engine/src/assets/compression/ModelTransformFunctions'
import { pathResolver } from '@etherealengine/engine/src/assets/functions/pathResolver'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { getComponent, hasComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { SceneObjectComponent } from '@etherealengine/engine/src/scene/components/SceneObjectComponent'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { modelTransformPath } from '@etherealengine/engine/src/schemas/assets/model-transform.schema'
import { SceneID } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { useHookstate } from '@hookstate/core'
import { MathUtils } from 'three'
import { exportRelativeGLTF } from '../../../functions/exportGLTF'
import { EditorState } from '../../../services/EditorServices'
import { SelectionState } from '../../../services/SelectionServices'

import { addObjectToGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { proxifyParentChildRelationships } from '@etherealengine/engine/src/scene/functions/loadGLTFModel'
import { Group } from 'three'

const createSceneEntity = (name: string, parentEntity: Entity | null = null, sceneID?: SceneID): Entity => {
  const entity = createEntity()
  setComponent(entity, NameComponent, name)
  setComponent(entity, VisibleComponent)
  setComponent(entity, TransformComponent)
  setComponent(entity, EntityTreeComponent, { parentEntity })

  if (parentEntity != null) {
    sceneID ??= getComponent(parentEntity!, SourceComponent)
  }
  sceneID ??= getState(SceneState).activeScene!
  setComponent(entity, SourceComponent, sceneID)

  const uuid = MathUtils.generateUUID() as EntityUUID
  setComponent(entity, UUIDComponent, uuid)

  setComponent(entity, SceneObjectComponent)

  // These additional properties and relations are required for
  // the current GLTF exporter to successfully generate a GLTF.
  const obj3d = new Group()
  obj3d.entity = entity
  addObjectToGroup(entity, obj3d)
  proxifyParentChildRelationships(obj3d)

  return entity
}

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

    const srcProject = getState(EditorState).projectName!

    for (const entity of modelEntities) {
      const modelComponent = getComponent(entity, ModelComponent)
      const modelSrc = modelComponent.src

      const relativePath = pathResolver()
        .exec(modelSrc)?.[2]
        .replace(/\.[^.]*$/, '')
      const modelFormat = modelSrc.endsWith('.gltf') ? 'gltf' : 'glb'

      const lodPaths = await createLODS(modelSrc, modelFormat)
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
