import { DirectionalLight } from 'three'

import { getState } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineRendererState } from '../EngineRendererState'
import { EngineRenderer } from '../WebGLRendererSystem'

export const updateShadowMap = (disable?: boolean) => {
  const type = Engine.instance.currentWorld.sceneMetadata.renderSettings.shadowMapType.value
  const enabled = getState(EngineRendererState).useShadows.value && !disable

  EngineRenderer.instance.renderer.shadowMap.enabled = enabled
  EngineRenderer.instance.renderer.shadowMap.type = type
  EngineRenderer.instance.renderer.shadowMap.needsUpdate = true

  Engine.instance.currentWorld.scene.traverse((node: DirectionalLight) => {
    if (node.isDirectionalLight && node.shadow) {
      node.shadow.map?.dispose()
    }
  })
}
