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

import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

import {
  DefaultModelTransformParameters,
  ModelTransformParameters
} from '@etherealengine/engine/src/assets/classes/ModelTransform'
import { transformModel as clientSideTransformModel } from '@etherealengine/engine/src/assets/compression/ModelTransformFunctions'
import { getFileName } from '@etherealengine/engine/src/assets/functions/pathResolver'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { getComponent, hasComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createSceneEntity } from '@etherealengine/engine/src/ecs/functions/createSceneEntity'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { modelTransformPath } from '@etherealengine/engine/src/schemas/assets/model-transform.schema'
import { getMutableState } from '@etherealengine/hyperflux'
import { useHookstate } from '@hookstate/core'
import exportGLTF from '../../../functions/exportGLTF'
import { SelectionState } from '../../../services/SelectionServices'

type LODVariantDescriptor = {
  parms: ModelTransformParameters
  metadata: Record<string, any>
}

async function createLODVariants(
  entity: Entity,
  lods: LODVariantDescriptor[],
  heuristic: 'DISTANCE' | 'SCENE_SCALE' | 'MANUAL' | 'DEVICE' = 'MANUAL'
) {
  const modelComponent = getComponent(entity, ModelComponent)
  const modelSrc = modelComponent.src
  const modelFormat = modelSrc.endsWith('.gltf') ? 'gltf' : 'glb'

  const lodVariantParms: ModelTransformParameters[] = lods.map((lod, index) => {
    let dst = getFileName(modelSrc).replace(/\.[^\.]+$/, '')
    if (lods.length > 0) {
      dst += `-LOD_${index}`
    }
    dst += '.' + modelFormat

    return {
      ...lod.parms,
      src: modelSrc,
      modelFormat,
      dst
    }
  })

  const clientside = true
  for (const variant of lodVariantParms) {
    if (clientside) {
      await clientSideTransformModel(variant)
    } else {
      await Engine.instance.api.service(modelTransformPath).create(variant)
    }
  }

  const result = createSceneEntity('container')
  setComponent(result, ModelComponent)
  const variant = createSceneEntity('LOD Variant', result)
  setComponent(variant, ModelComponent)
  setComponent(variant, VariantComponent, {
    levels: lods.map((lod, index) => ({
      src: modelSrc.replace(/[^\/]+$/, lodVariantParms[index].dst),
      metadata: lod.metadata
    })),
    heuristic
  })

  await exportGLTF(result, modelSrc.replace(/\.[^.]*$/, `-lodded.${modelFormat}`))
}

export const LODRunner = () => {
  const titleText = 'LOD Runner'
  const tooltipText = 'Create LOD variants for selected model'
  const selectionState = useHookstate(getMutableState(SelectionState))

  async function createLODVariantsForSelection() {
    const modelEntities = selectionState.selectedEntities.value.filter((entity) => hasComponent(entity, ModelComponent))
    const defaults = DefaultModelTransformParameters
    for (const entity of modelEntities) {
      const lods = [
        { parms: { ...defaults, maxTextureSize: 2048 }, metadata: { device: 'DESKTOP' } },
        { parms: { ...defaults, maxTextureSize: 1024 }, metadata: { device: 'XR' } },
        { parms: { ...defaults, maxTextureSize: 512 }, metadata: { device: 'MOBILE' } }
      ]
      await createLODVariants(entity, lods, 'DEVICE')
    }
  }

  return (
    <>
      <div id="lod-runner" className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer}>
        <InfoTooltip title={titleText} info={tooltipText}>
          <button
            onClick={createLODVariantsForSelection}
            className={styles.toolButton}
            style={{ background: 'orange' }}
          >
            <Icon type={'DirectionsRun'} fontSize="small" />
          </button>
        </InfoTooltip>
      </div>
    </>
  )
}

export default LODRunner
