import { DirectionalLight, Light, PerspectiveCamera } from 'three'

import { getState } from '@xrengine/hyperflux'

import { CSM } from '../../assets/csm/CSM'
import { isHMD } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { DirectionalLightComponent } from '../../scene/components/DirectionalLightComponent'
import { setVisibleComponent } from '../../scene/components/VisibleComponent'
import { EngineRendererState } from '../EngineRendererState'
import { EngineRenderer } from '../WebGLRendererSystem'

export const updateShadowMap = (disable?: boolean) => {
  const type = Engine.instance.currentWorld.sceneMetadata.renderSettings.shadowMapType.value
  const enabled = getState(EngineRendererState).useShadows.value && !disable

  EngineRenderer.instance.renderer.shadowMap.enabled = enabled
  EngineRenderer.instance.renderer.shadowMap.type = type
  EngineRenderer.instance.renderer.shadowMap.needsUpdate = true

  Engine.instance.currentWorld.scene.traverse((node: Light) => {
    if (node.isLight && node.shadow) {
      node.shadow.map?.dispose()
      node.castShadow = enabled
    }
  })

  updateCSM()
}

export const updateCSM = () => {
  if (
    isHMD ||
    !EngineRenderer.instance.renderer.shadowMap.enabled ||
    !Engine.instance.currentWorld.sceneMetadata.renderSettings.csm.value
  ) {
    disposeCSM()
    return
  }

  let activeCSMLight: DirectionalLight | undefined
  if (EngineRenderer.instance.activeCSMLightEntity) {
    activeCSMLight = getComponent(EngineRenderer.instance.activeCSMLightEntity, DirectionalLightComponent).light
    setVisibleComponent(EngineRenderer.instance.activeCSMLightEntity, false)
  }

  for (const entity of EngineRenderer.instance.directionalLightEntities) {
    const light = getComponent(entity, DirectionalLightComponent)?.light
    if (light) light.castShadow = false
  }

  if (EngineRenderer.instance.csm) {
    EngineRenderer.instance.csm.remove()
    EngineRenderer.instance.csm.dispose()
  }

  EngineRenderer.instance.csm = new CSM({
    camera: Engine.instance.currentWorld.camera as PerspectiveCamera,
    parent: Engine.instance.currentWorld.scene,
    light: activeCSMLight
  })

  if (activeCSMLight) {
    activeCSMLight.getWorldDirection(EngineRenderer.instance.csm.lightDirection)
  }
}

export const disposeCSM = () => {
  if (!EngineRenderer.instance.csm) return

  EngineRenderer.instance.csm.remove()
  EngineRenderer.instance.csm.dispose()
  EngineRenderer.instance.csm = undefined!

  if (EngineRenderer.instance.activeCSMLightEntity) {
    setVisibleComponent(EngineRenderer.instance.activeCSMLightEntity, true)
  }

  for (const entity of EngineRenderer.instance.directionalLightEntities) {
    const light = getComponent(entity, DirectionalLightComponent)?.light
    if (light) light.castShadow = getComponent(entity, DirectionalLightComponent).castShadow
  }
}
