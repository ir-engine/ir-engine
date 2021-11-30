import {
  BlendFunction,
  EffectComposer,
  EffectPass,
  RenderPass,
  TextureEffect,
  NormalPass,
  DepthDownsamplingPass
} from 'postprocessing'
import { NearestFilter, RGBFormat, WebGLRenderTarget } from 'three'
import { useEngine } from '../../ecs/classes/Engine'
import { EffectMap, Effects } from '../../scene/classes/PostProcessing'
import { EngineRenderer } from '../WebGLRendererSystem'

export const configureEffectComposer = (postprocessingComponent: any, remove?: boolean): void => {
  if (remove) {
    useEngine().effectComposer = null!
    return
  }

  if (!useEngine().effectComposer) useEngine().effectComposer = new EffectComposer(useEngine().renderer)
  else useEngine().effectComposer.removeAllPasses()

  const renderPass = new RenderPass(useEngine().scene, useEngine().camera)
  useEngine().effectComposer.addPass(renderPass)

  if (!postprocessingComponent) return
  EngineRenderer.instance.postProcessingConfig = postprocessingComponent

  const effects: any[] = []
  const effectKeys = EffectMap.keys()

  const normalPass = new NormalPass(useEngine().scene, useEngine().camera, {
    renderTarget: new WebGLRenderTarget(1, 1, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      format: RGBFormat,
      stencilBuffer: false
    })
  })

  const depthDownsamplingPass = new DepthDownsamplingPass({
    normalBuffer: normalPass.texture,
    resolutionScale: 0.5
  })

  for (let key of effectKeys) {
    const effect = postprocessingComponent[key]

    if (!effect || !effect.isActive) continue
    const effectClass = EffectMap.get(key)?.EffectClass

    if (!effectClass) return

    if (key === Effects.SSAOEffect) {
      const eff = new effectClass(useEngine().camera, normalPass.texture, {
        ...effect,
        normalDepthBuffer: depthDownsamplingPass.texture
      })
      useEngine().effectComposer[key] = eff
      effects.push(eff)
    } else if (key === Effects.DepthOfFieldEffect) {
      const eff = new effectClass(useEngine().camera, effect)
      useEngine().effectComposer[key] = eff
      effects.push(eff)
    } else if (key === Effects.OutlineEffect) {
      const eff = new effectClass(useEngine().scene, useEngine().camera, effect)
      useEngine().effectComposer[key] = eff
      effects.push(eff)
    } else {
      if (effectClass) {
        const eff = new effectClass(effect)
        useEngine().effectComposer[key] = eff
        effects.push(eff)
      }
    }
  }

  if (effects.length) {
    const textureEffect = new TextureEffect({
      blendFunction: BlendFunction.SKIP,
      texture: depthDownsamplingPass.texture
    })

    useEngine().effectComposer.addPass(depthDownsamplingPass)
    useEngine().effectComposer.addPass(new EffectPass(useEngine().camera, ...effects, textureEffect))
  }
}
