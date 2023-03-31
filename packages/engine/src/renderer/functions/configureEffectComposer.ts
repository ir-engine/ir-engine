import { BlendFunction, DepthDownsamplingPass, EffectPass, NormalPass, RenderPass, TextureEffect } from 'postprocessing'
import { NearestFilter, PerspectiveCamera, RGBAFormat, WebGLRenderTarget } from 'three'

import { getMutableState, NO_PROXY } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { EffectMap, EffectPropsSchema, Effects } from '../../scene/constants/PostProcessing'
import { EngineRenderer, getPostProcessingSceneMetadataState } from '../WebGLRendererSystem'
import { changeRenderMode } from './changeRenderMode'

export const configureEffectComposer = (remove?: boolean, camera: PerspectiveCamera = Engine.instance.camera): void => {
  if (!EngineRenderer.instance) return

  if (!EngineRenderer.instance.renderPass) {
    // we always want to have at least the render pass enabled
    const renderPass = new RenderPass(Engine.instance.scene, camera)
    EngineRenderer.instance.effectComposer.addPass(renderPass)
    EngineRenderer.instance.renderPass = renderPass
  }

  for (const pass of EngineRenderer.instance.effectComposer.passes) {
    if (pass !== EngineRenderer.instance.renderPass) EngineRenderer.instance.effectComposer.removePass(pass)
  }

  if (remove) {
    return
  }

  const postprocessing = getPostProcessingSceneMetadataState().get(NO_PROXY)
  if (!postprocessing.enabled) return

  const postProcessingEffects = postprocessing.effects as EffectPropsSchema

  const effects: any[] = []
  const effectKeys = EffectMap.keys()

  const normalPass = new NormalPass(Engine.instance.scene, camera, {
    renderTarget: new WebGLRenderTarget(1, 1, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      format: RGBAFormat,
      stencilBuffer: false
    })
  })

  const depthDownsamplingPass = new DepthDownsamplingPass({
    normalBuffer: normalPass.texture,
    resolutionScale: 0.5
  })

  for (let key of effectKeys) {
    const effect = postProcessingEffects[key]

    if (!effect || !effect.isActive) continue
    const effectClass = EffectMap.get(key)?.EffectClass

    if (!effectClass) return

    if (key === Effects.SSAOEffect) {
      const eff = new effectClass(camera, normalPass.texture, {
        ...effect,
        normalDepthBuffer: depthDownsamplingPass.texture
      })
      EngineRenderer.instance.effectComposer[key] = eff
      effects.push(eff)
    } else if (key === Effects.SSREffect) {
      const eff = new effectClass(Engine.instance.scene, camera, effect)
      EngineRenderer.instance.effectComposer[key] = eff
      effects.push(eff)
    } else if (key === Effects.DepthOfFieldEffect) {
      const eff = new effectClass(camera, effect)
      EngineRenderer.instance.effectComposer[key] = eff
      effects.push(eff)
    } else if (key === Effects.OutlineEffect) {
      const eff = new effectClass(Engine.instance.scene, camera, effect)
      EngineRenderer.instance.effectComposer[key] = eff
      effects.push(eff)
    } else {
      if (effectClass) {
        const eff = new effectClass(effect)
        EngineRenderer.instance.effectComposer[key] = eff
        effects.push(eff)
      }
    }
  }

  if (effects.length) {
    const textureEffect = new TextureEffect({
      blendFunction: BlendFunction.SKIP,
      texture: depthDownsamplingPass.texture
    })

    EngineRenderer.instance.effectComposer.addPass(depthDownsamplingPass)
    EngineRenderer.instance.effectComposer.addPass(new EffectPass(camera, ...effects, textureEffect))
  }

  if (getMutableState(EngineState).isEditor.value) changeRenderMode()
}
