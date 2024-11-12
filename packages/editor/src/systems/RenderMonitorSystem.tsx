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

import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { useQuery } from '@ir-engine/ecs'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { RenderInfoState, SceneComplexityParams } from '@ir-engine/spatial/src/renderer/RenderInfoSystem'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { LightTagComponent } from '@ir-engine/spatial/src/renderer/components/lights/LightTagComponent'
import { ResourceState } from '@ir-engine/spatial/src/resources/ResourceState'
import { useTranslation } from 'react-i18next'
import { EditorWarningState } from '../services/EditorWarningServices'

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

export const RenderMonitorSystem = defineSystem({
  uuid: 'ee.editor.RenderMonitorSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const { t } = useTranslation()

    const renderInfoState = useHookstate(getMutableState(RenderInfoState))
    const resourceState = useHookstate(getMutableState(ResourceState))
    const lightQuery = useQuery([LightTagComponent, VisibleComponent, SourceComponent])
    const [sceneComplexityNotif] = useFeatureFlags([FeatureFlags.Studio.UI.SceneComplexityNotification])
    useEffect(() => {
      const params = {
        vertices: resourceState.totalVertexCount.value,
        triangles: renderInfoState.info.triangles.value,
        texturesMB: renderInfoState.info.texturesMB.value,
        drawCalls: renderInfoState.info.calls.value,
        shaderComplexity: renderInfoState.info.shaderComplexity.value,
        lights: lightQuery.length
      }

      renderInfoState.info.sceneComplexity.set(calculateSceneComplexity(params))
    }, [
      resourceState.totalVertexCount,
      renderInfoState.info.triangles.value,
      renderInfoState.info.texturesMB.value,
      renderInfoState.info.calls.value,
      renderInfoState.info.shaderComplexity.value,
      lightQuery
    ])

    useEffect(() => {
      // these thresholds are to be adjusted  based on experimentation
      if (!sceneComplexityNotif) return

      let warning = t('editor:warnings.sceneComplexity', { sceneComplexity: SceneComplexity.VeryHeavy.label })
      if (renderInfoState.info.sceneComplexity.value < SceneComplexity.VeryLight.value) return
      if (renderInfoState.info.sceneComplexity.value < SceneComplexity.Light.value) return
      if (renderInfoState.info.sceneComplexity.value < SceneComplexity.Medium.value) return
      if (renderInfoState.info.sceneComplexity.value < SceneComplexity.Heavy.value)
        warning = t('editor:warnings.sceneComplexity', { sceneComplexity: SceneComplexity.Heavy.label })
      getMutableState(EditorWarningState).warning.set(warning)

      return () => {
        getMutableState(EditorWarningState).warning.set(null)
      }
    }, [renderInfoState.info.sceneComplexity.value])

    return null
  }
})
