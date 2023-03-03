import { DirectionalLight } from 'three'

import { getState, useHookstate } from '@etherealengine/hyperflux'

import { iOS } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { RendererState } from '../../renderer/RendererState'
import { isHeadset, useIsHeadset } from '../../xr/XRState'
import { RenderModes } from '../constants/RenderModes'
import { EngineRenderer, getRendererSceneMetadataState } from '../WebGLRendererSystem'

export const getShadowsEnabled = () => {
  const rendererState = getState(RendererState)
  return !isHeadset() && !iOS && rendererState.useShadows.value && rendererState.renderMode.value === RenderModes.SHADOW
}

export const useShadowsEnabled = () => {
  const isHeadset = useIsHeadset()
  const rendererState = getState(RendererState)
  const useShadows = useHookstate(rendererState.useShadows).value
  const renderMode = useHookstate(rendererState.renderMode).value
  return !isHeadset && !iOS && useShadows && renderMode === RenderModes.SHADOW
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
