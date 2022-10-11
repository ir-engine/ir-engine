import { BlendFunction, DepthDownsamplingPass, EffectPass, NormalPass, RenderPass, TextureEffect } from 'postprocessing'
import { NearestFilter, RGBAFormat, WebGLRenderTarget } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { EffectMap, EffectPropsSchema, Effects, OutlineEffectProps } from '../../scene/constants/PostProcessing'
import { accessEngineRendererState } from '../EngineRendererState'
import { EngineRenderer } from '../WebGLRendererSystem'
import { changeRenderMode } from './changeRenderMode'

export const configureEffectComposer = (remove?: boolean, camera = Engine.instance.currentWorld.camera): void => {
  if (!EngineRenderer.instance) return

  if (!EngineRenderer.instance.renderPass) {
    // we always want to have at least the render pass enabled
    const renderPass = new RenderPass(Engine.instance.currentWorld.scene, camera)
    EngineRenderer.instance.effectComposer.addPass(renderPass)
    EngineRenderer.instance.renderPass = renderPass
  }

  for (const pass of EngineRenderer.instance.effectComposer.passes) {
    if (pass !== EngineRenderer.instance.renderPass) EngineRenderer.instance.effectComposer.removePass(pass)
  }

  if (remove) {
    return
  }

  const postprocessing = Engine.instance.currentWorld.sceneMetadata.get({ noproxy: true }).postprocessing
  if (!postprocessing.enabled) return

  const postProcessingEffects = postprocessing.effects as EffectPropsSchema

  const effects: any[] = []
  const effectKeys = EffectMap.keys()

  const normalPass = new NormalPass(Engine.instance.currentWorld.scene, camera, {
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
    } else if (key === Effects.DepthOfFieldEffect) {
      const eff = new effectClass(camera, effect)
      EngineRenderer.instance.effectComposer[key] = eff
      effects.push(eff)
    } else if (key === Effects.OutlineEffect) {
      const eff = new effectClass(Engine.instance.currentWorld.scene, camera, effect)
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

  if (Engine.instance.isEditor) changeRenderMode(accessEngineRendererState().renderMode.value)
}
