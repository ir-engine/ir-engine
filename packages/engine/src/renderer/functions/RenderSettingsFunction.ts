import { DirectionalLight } from 'three'

import { getState, useHookstate } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { isHeadset } from '../../xr/XRState'
import { RenderModes } from '../constants/RenderModes'
import { RendererState } from '../RendererState'
import { EngineRenderer, getRendererSceneMetadataState } from '../WebGLRendererSystem'

export const getShadowsEnabled = () => {
  const rendererState = getState(RendererState)
  return !isHeadset() && rendererState.useShadows.value && rendererState.renderMode.value === RenderModes.SHADOW
}

export const useShadowsEnabled = () => {
  const rendererState = useHookstate(getState(RendererState))
  return !isHeadset() && rendererState.useShadows.value && rendererState.renderMode.value === RenderModes.SHADOW
}

export const updateShadowMap = () => {
  const enabled = getShadowsEnabled()
  const type = getRendererSceneMetadataState(Engine.instance.currentWorld).shadowMapType.value

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
