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

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { useQuery } from '@ir-engine/ecs'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { RenderInfoState, SceneComplexityParams } from '@ir-engine/spatial/src/renderer/RenderInfoSystem'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { LightTagComponent } from '@ir-engine/spatial/src/renderer/components/lights/LightTagComponent'
import { useTranslation } from 'react-i18next'

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
    const lightQuery = useQuery([LightTagComponent, VisibleComponent, SourceComponent])
    const [sceneComplexityNotif] = useFeatureFlags([FeatureFlags.Studio.UI.SceneComplexityNotification])
    const prevSceneComplexity = useHookstate(0)

    useEffect(() => {
      const params = {
        // Change this back to the resource state once the GLTF loader refactor is done
        vertices: renderInfoState.info.triangles.value,
        triangles: renderInfoState.info.triangles.value,
        texturesMB: renderInfoState.info.texturesMB.value,
        drawCalls: renderInfoState.info.calls.value,
        shaderComplexity: renderInfoState.info.shaderComplexity.value,
        lights: lightQuery.length
      }

      renderInfoState.info.sceneComplexity.set(calculateSceneComplexity(params))
    }, [
      renderInfoState.info.triangles.value,
      renderInfoState.info.texturesMB.value,
      renderInfoState.info.calls.value,
      renderInfoState.info.shaderComplexity.value,
      lightQuery
    ])

    useEffect(() => {
      if (!sceneComplexityNotif) return

      // these thresholds are to be adjusted  based on experimentation
      const sceneComplexity = renderInfoState.info.sceneComplexity.value
      if (
        sceneComplexity < SceneComplexity.VeryLight.value ||
        sceneComplexity < SceneComplexity.Light.value ||
        sceneComplexity < SceneComplexity.Medium.value ||
        sceneComplexity < SceneComplexity.Heavy.value
      ) {
        prevSceneComplexity.set(sceneComplexity)
        return
      }

      const prevValue = prevSceneComplexity.value

      let warningThreshold: number = SceneComplexity.VeryHeavy.value
      if (prevValue < warningThreshold && sceneComplexity >= warningThreshold) {
        const warning = t('editor:warnings.sceneComplexity', { sceneComplexity: SceneComplexity.VeryHeavy.label })
        NotificationService.dispatchNotify(warning, { variant: 'warning' })
      }

      warningThreshold = SceneComplexity.Heavy.value
      if (prevValue < warningThreshold && sceneComplexity >= warningThreshold) {
        const warning = t('editor:warnings.sceneComplexity', { sceneComplexity: SceneComplexity.Heavy.label })
        NotificationService.dispatchNotify(warning, { variant: 'warning' })
      }

      prevSceneComplexity.set(sceneComplexity)
    }, [renderInfoState.info.sceneComplexity.value])

    return null
  }
})
