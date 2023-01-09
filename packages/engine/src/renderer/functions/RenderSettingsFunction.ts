import { DirectionalLight } from 'three'

import { getMutableState } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineRendererState } from '../EngineRendererState'
import { EngineRenderer, getRendererSceneMetadataState } from '../WebGLRendererSystem'

export const updateShadowMap = (disable?: boolean) => {
  const type = getRendererSceneMetadataState(Engine.instance.currentWorld).shadowMapType.value
  const enabled = getMutableState(EngineRendererState).useShadows.value && !disable

  EngineRenderer.instance.renderer.shadowMap.enabled = enabled
  EngineRenderer.instance.renderer.shadowMap.type = type
  EngineRenderer.instance.renderer.shadowMap.needsUpdate = true

  Engine.instance.currentWorld.scene.traverse((node: DirectionalLight) => {
    if (node.isDirectionalLight && node.shadow) {
      node.shadow.map?.dispose()
      node.shadow.map = null as any
      node.shadow.camera.updateProjectionMatrix()
      node.shadow.needsUpdate = true
    }
  })
}
