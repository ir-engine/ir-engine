import { DirectionalLight, PerspectiveCamera } from 'three'

import { getState } from '@xrengine/hyperflux'

import { CSM } from '../../assets/csm/CSM'
import { isHMD } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import {
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  removeQuery
} from '../../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { XRState } from '../../xr/XRState'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { VisibleComponent } from '../components/VisibleComponent'

export default async function ShadowSystem(world: World) {
  const directionalLightQuery = defineQuery([DirectionalLightComponent])

  let lastActiveDirectionLight = null as DirectionalLight | null

  const execute = () => {
    if (world.fixedTick % 50 === 0) return

    let activeDirectionalLight = null as DirectionalLight | null
    let activeDirectionalLightEntity = UndefinedEntity as Entity

    if (getState(XRState).isEstimatingLight.value)
      activeDirectionalLight = getState(XRState).lightEstimator.value.directionalLight
    else
      for (const entity of directionalLightQuery()) {
        const component = getComponent(entity, DirectionalLightComponent)
        activeDirectionalLightEntity = entity
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

      if (activeDirectionalLightEntity && hasComponent(activeDirectionalLightEntity, VisibleComponent))
        removeComponent(activeDirectionalLightEntity, VisibleComponent)
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
