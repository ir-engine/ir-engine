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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  defineSystem,
  Entity,
  getComponent,
  LayerFunctions,
  PresentationSystemGroup,
  removeComponent
} from '@ir-engine/ecs'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent,
  SerializedTexture
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { MeshStandardMaterial } from 'three'
import { commitProperty } from '../components/properties/Util'
import { LightmapBakeComponent } from './LightmapBakeComponent'
import { Lightmapper } from './LightmapperFunctions'

const lightmapQuery = defineQuery([LightmapBakeComponent])

const execute = () => {
  for (const entity of lightmapQuery()) {
    const {
      renderTarget,
      raycastMesh,
      orthographicCamera,
      raycastMaterial,
      entities,
      currentSamples,
      totalSamples,
      channel
    } = getComponent(entity, LightmapBakeComponent)

    if (currentSamples < totalSamples) {
      getComponent(entity, LightmapBakeComponent).currentSamples = Lightmapper.sample(
        raycastMesh,
        renderTarget,
        raycastMaterial,
        orthographicCamera,
        getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent).renderer!,
        currentSamples
      )
    } else {
      Lightmapper.uploadLightmapTexture(renderTarget, entity)
        .then((uploadedUrl) => {
          if (uploadedUrl) {
            const materials = [] as Entity[]
            for (const entity of entities) {
              const materialEntities = getComponent(entity, MaterialInstanceComponent).entities
              materials.push(...materialEntities)
            }
            for (const materialEntity of materials) {
              commitProperty(MaterialStateComponent, 'parameters.aoMap' as any, [
                LayerFunctions.getAuthoringCounterpart(materialEntity)
              ])({ source: uploadedUrl, channel } as SerializedTexture)
              commitProperty(MaterialStateComponent, 'parameters.aoMapIntensity' as any, [
                LayerFunctions.getAuthoringCounterpart(materialEntity)
              ])(1)
            }
          }
        })
        .catch((error) => {
          console.error('Failed to upload lightmap texture:', error)
        })

      removeComponent(entity, LightmapBakeComponent)
    }

    // inelegant way to preview the progressive render
    // data assigned to material here will be overwritten by AuthoringState when the overrides are applied
    entities.map((entity) => {
      const materialInstanceComponent = getComponent(entity, MaterialInstanceComponent)
      for (const materialEntity of materialInstanceComponent.entities) {
        const material = getComponent(materialEntity, MaterialStateComponent).material as MeshStandardMaterial
        material.aoMapIntensity = 1
        material.aoMap = renderTarget.texture
        material.aoMap!.channel = channel
        material.needsUpdate = true
      }
    })
  }
}

export const LightmapSystem = defineSystem({
  uuid: 'ee.engine.LightmapSystem',
  insert: { with: PresentationSystemGroup },
  execute
})
