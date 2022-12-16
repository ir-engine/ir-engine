import { useEffect } from 'react'
import { DirectionalLight, Group, PerspectiveCamera } from 'three'

import { getState, startReactor, useHookstate } from '@xrengine/hyperflux'

import { CSM } from '../../assets/csm/CSM'
import CSMHelper from '../../assets/csm/CSMHelper'
import { isHMD } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import {
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  removeQuery,
  useQuery
} from '../../ecs/functions/ComponentFunctions'
import { EngineRendererState } from '../../renderer/EngineRendererState'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { XRState } from '../../xr/XRState'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { VisibleComponent } from '../components/VisibleComponent'

export default async function ShadowSystem(world: World) {
  const directionalLightQuery = defineQuery([DirectionalLightComponent])

  let lastActiveDirectionLight = null as DirectionalLight | null

  const xrState = getState(XRState)
  const renderState = getState(EngineRendererState)
  // let helper

  const csmGroup = new Group()
  csmGroup.name = 'CSM-group'
  Engine.instance.currentWorld.scene.add(csmGroup)

  const csmReactor = startReactor(() => {
    const lightEstimator = useHookstate(xrState.isEstimatingLight)
    const directionalLights = useQuery(directionalLightQuery)

    useEffect(() => {
      let activeDirectionalLight = null as DirectionalLight | null
      let activeDirectionalLightEntity = UndefinedEntity as Entity

      if (lightEstimator.value) activeDirectionalLight = xrState.lightEstimator.value!.directionalLight
      else
        for (const entity of directionalLights) {
          const component = getComponent(entity, DirectionalLightComponent)
          if (component.useInCSM) {
            activeDirectionalLightEntity = entity
            activeDirectionalLight = component.light
          }
        }

      const useCSM =
        !isHMD &&
        EngineRenderer.instance.renderer.shadowMap.enabled &&
        Engine.instance.currentWorld.sceneMetadata.renderSettings.csm.value

      if (useCSM && activeDirectionalLight) {
        if (!EngineRenderer.instance.csm) {
          EngineRenderer.instance.csm = new CSM({
            camera: Engine.instance.currentWorld.camera as PerspectiveCamera,
            parent: csmGroup,
            light: activeDirectionalLight
          })
          // helper = new CSMHelper(EngineRenderer.instance.csm)
          // Engine.instance.currentWorld.scene.add(helper)
        }

        if (activeDirectionalLightEntity && hasComponent(activeDirectionalLightEntity, VisibleComponent))
          removeComponent(activeDirectionalLightEntity, VisibleComponent)
        activeDirectionalLight.visible = false

        lastActiveDirectionLight = activeDirectionalLight

        for (const light of EngineRenderer.instance.csm.lights) {
          light.color = activeDirectionalLight.color
          light.intensity = activeDirectionalLight.intensity
          light.shadow.bias = activeDirectionalLight.shadow.bias
          light.shadow.radius = activeDirectionalLight.shadow.radius
          light.shadow.mapSize = activeDirectionalLight.shadow.mapSize
          light.shadow.camera.far = activeDirectionalLight.shadow.camera.far
        }
      } else if (EngineRenderer.instance.csm) {
        if (lastActiveDirectionLight) lastActiveDirectionLight.visible = true
        lastActiveDirectionLight = null

        EngineRenderer.instance.csm.remove()
        EngineRenderer.instance.csm.dispose()
        EngineRenderer.instance.csm = undefined!
      }
    }, [lightEstimator, directionalLights])

    return null
  })

  const execute = () => {
    if (!EngineRenderer.instance.csm) return
    EngineRenderer.instance.csm.sourceLight.getWorldDirection(EngineRenderer.instance.csm.lightDirection)
    if (renderState.qualityLevel.value > 0) EngineRenderer.instance.csm.update()
    // if (helper) helper.update()
  }

  const cleanup = async () => {
    removeQuery(world, directionalLightQuery)
    csmReactor.stop()
  }

  return { execute, cleanup }
}
