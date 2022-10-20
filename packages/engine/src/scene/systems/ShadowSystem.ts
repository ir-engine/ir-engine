import { DirectionalLight, PerspectiveCamera } from 'three'

import { getState } from '@xrengine/hyperflux'

import { CSM } from '../../assets/csm/CSM'
import { isHMD } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { XRState } from '../../xr/XRState'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'

export default async function ShadowSystem(world: World) {
  const directionalLightQuery = defineQuery([DirectionalLightComponent])

  let lastActiveDirectionLight = null as DirectionalLight | null

  const execute = () => {
    let activeDirectionalLight = null as DirectionalLight | null

    if (getState(XRState).isEstimatingLight.value)
      activeDirectionalLight = getState(XRState).lightEstimator.value.directionalLight
    else
      for (const entity of directionalLightQuery()) {
        const component = getComponent(entity, DirectionalLightComponent)
        if (component.useInCSM) activeDirectionalLight = component.light
      }

    const useCSM =
      !isHMD &&
      EngineRenderer.instance.renderer.shadowMap.enabled &&
      Engine.instance.currentWorld.sceneMetadata.renderSettings.csm.value

    if (useCSM && activeDirectionalLight) {
      if (!EngineRenderer.instance.csm)
        EngineRenderer.instance.csm = new CSM({
          camera: Engine.instance.currentWorld.camera as PerspectiveCamera,
          parent: Engine.instance.currentWorld.scene
        })

      activeDirectionalLight.visible = false
      lastActiveDirectionLight = activeDirectionalLight

      EngineRenderer.instance.csm.changeLights(activeDirectionalLight)
      activeDirectionalLight.getWorldDirection(EngineRenderer.instance.csm.lightDirection)

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
  }

  const cleanup = async () => {
    removeQuery(world, directionalLightQuery)
  }

  return { execute, cleanup }
}
