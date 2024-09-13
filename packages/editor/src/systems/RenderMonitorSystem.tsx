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

import { useEffect } from 'react'

import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { SceneComplexity, SceneComplexityWeights } from '@ir-engine/engine/src/scene/constants/SceneConstants'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'

import { useQuery } from '@ir-engine/ecs'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { RenderInfoState } from '@ir-engine/spatial/src/renderer/RenderInfoSystem'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { LightTagComponent } from '@ir-engine/spatial/src/renderer/components/lights/LightTagComponent'
import { ResourceState, ResourceType } from '@ir-engine/spatial/src/resources/ResourceState'
import { useTranslation } from 'react-i18next'
import { EditorWarningState } from '../services/EditorWarningServices'

type SceneComplexityParams = {
  vertices: number
  triangles: number
  texturesMB: number
  lights: number
  drawCalls: number
  shaderComplexity: number
}

function calculateSceneComplexity(params: SceneComplexityParams): number {
  const complexity =
    SceneComplexityWeights.verticesWeight * params.vertices +
    SceneComplexityWeights.trianglesWeight * params.triangles +
    SceneComplexityWeights.texturesMBWeight * params.texturesMB +
    SceneComplexityWeights.lightsWeight * params.lights +
    SceneComplexityWeights.drawCallsWeight * params.drawCalls +
    SceneComplexityWeights.shaderComplexityWeight * params.shaderComplexity
  return complexity
}

// count number of lines in vertex and fragment shaders
function getShaderComplexity(resources: Record<string, any>): number {
  const countLines = (code?: string): number => (code || '').split('\n').length
  const totalComplexity = Object.values(resources)
    .filter((resource) => resource.type === ResourceType.Material)
    .flatMap((resource) => (Array.isArray(resource.asset) ? resource.asset : [resource.asset]))
    .filter((material) => material.isShaderMaterial || material.isMeshStandardMaterial)
    .reduce(
      (total, material) => {
        total.vertexInstructions += countLines(material.vertexShader)
        total.fragmentInstructions += countLines(material.fragmentShader)
        return total
      },
      { vertexInstructions: 0, fragmentInstructions: 0 }
    )

  return totalComplexity.vertexInstructions + totalComplexity.fragmentInstructions
}

export const RenderMonitorSystem = defineSystem({
  uuid: 'ee.editor.RenderMonitorSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const { t } = useTranslation()

    const sceneComplexityScore = useHookstate(0)

    const renderInfoState = useHookstate(getMutableState(RenderInfoState))
    const resourceState = useHookstate(getMutableState(ResourceState))
    const lightQuery = useQuery([LightTagComponent, VisibleComponent, SourceComponent])

    useEffect(() => {
      const params = {
        vertices: resourceState.totalVertexCount.value,
        triangles: renderInfoState.info.triangles.value,
        texturesMB: resourceState.totalBufferCount.value / (1024 * 1024),
        drawCalls: renderInfoState.info.calls.value,
        shaderComplexity: getShaderComplexity(resourceState.resources.value),
        lights: lightQuery.length
      }

      sceneComplexityScore.set(calculateSceneComplexity(params))
    }, [
      resourceState.totalVertexCount,
      resourceState.totalBufferCount,
      renderInfoState.info.triangles.value,
      renderInfoState.info.calls.value,
      renderInfoState.info.programs.value,
      lightQuery
    ])

    useEffect(() => {
      // these thresholds are to be adjusted  based on experimentation
      let warning = t('editor:warnings.sceneComplexity', { sceneComplexity: SceneComplexity.VeryHeavy.label })
      if (sceneComplexityScore.value < SceneComplexity.VeryLight.value) return
      if (sceneComplexityScore.value < SceneComplexity.Light.value) return
      if (sceneComplexityScore.value < SceneComplexity.Medium.value) return
      if (sceneComplexityScore.value < SceneComplexity.Heavy.value)
        warning = t('editor:warnings.sceneComplexity', { sceneComplexity: SceneComplexity.Heavy.label })
      getMutableState(EditorWarningState).warning.set(warning)

      return () => {
        getMutableState(EditorWarningState).warning.set(null)
      }
    }, [sceneComplexityScore])

    return null
  }
})
