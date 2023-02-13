import { DirectionalLight } from 'three'

import { getState, useHookstate } from '@xrengine/hyperflux'

import { iOS } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { isHeadset, useIsHeadset } from '../../xr/XRState'
import { RenderModes } from '../constants/RenderModes'
import { EngineRendererState } from '../WebGLRendererSystem'
import { EngineRenderer, getRendererSceneMetadataState } from '../WebGLRendererSystem'

export const getShadowsEnabled = () => {
  const engineRendererState = getState(EngineRendererState)
  return (
    !isHeadset() &&
    !iOS &&
    engineRendererState.useShadows.value &&
    engineRendererState.renderMode.value === RenderModes.SHADOW
  )
}

export const useShadowsEnabled = () => {
  const isHeadset = useIsHeadset()
  const engineRendererState = useHookstate(getState(EngineRendererState))
  return (
    !isHeadset &&
    !iOS &&
    engineRendererState.useShadows.value &&
    engineRendererState.renderMode.value === RenderModes.SHADOW
  )
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
