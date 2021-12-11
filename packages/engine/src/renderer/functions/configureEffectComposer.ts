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
import { Engine } from '../../ecs/classes/Engine'
import { getAllComponentsOfType } from '../../ecs/functions/ComponentFunctions'
import { EffectMap, Effects } from '../../scene/classes/PostProcessing'
import { PostprocessingComponent } from '../../scene/components/PostprocessingComponent'

export const configureEffectComposer = (remove?: boolean): void => {
  Engine.effectComposer.removeAllPasses()

  // we always want to have at least the render pass enabled
  const renderPass = new RenderPass(Engine.scene, Engine.camera)
  Engine.effectComposer.addPass(renderPass)

  if (remove) {
    return
  }

  const comps = getAllComponentsOfType(PostprocessingComponent)

  if (!comps.length) return
  const postProcessing = comps[0]

  const effects: any[] = []
  const effectKeys = EffectMap.keys()

  const normalPass = new NormalPass(Engine.scene, Engine.camera, {
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
    const effect = postProcessing.options[key]

    if (!effect || !effect.isActive) continue
    const effectClass = EffectMap.get(key)?.EffectClass

    if (!effectClass) return

    if (key === Effects.SSAOEffect) {
      const eff = new effectClass(Engine.camera, normalPass.texture, {
        ...effect,
        normalDepthBuffer: depthDownsamplingPass.texture
      })
      Engine.effectComposer[key] = eff
      effects.push(eff)
    } else if (key === Effects.DepthOfFieldEffect) {
      const eff = new effectClass(Engine.camera, effect)
      Engine.effectComposer[key] = eff
      effects.push(eff)
    } else if (key === Effects.OutlineEffect) {
      const eff = new effectClass(Engine.scene, Engine.camera, effect)
      Engine.effectComposer[key] = eff
      effects.push(eff)
    } else {
      if (effectClass) {
        const eff = new effectClass(effect)
        Engine.effectComposer[key] = eff
        effects.push(eff)
      }
    }
  }

  if (effects.length) {
    const textureEffect = new TextureEffect({
      blendFunction: BlendFunction.SKIP,
      texture: depthDownsamplingPass.texture
    })

    Engine.effectComposer.addPass(depthDownsamplingPass)
    Engine.effectComposer.addPass(new EffectPass(Engine.camera, ...effects, textureEffect))
  }
}
