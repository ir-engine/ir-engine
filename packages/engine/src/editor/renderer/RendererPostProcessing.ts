import { NearestFilter, RGBFormat, WebGLRenderTarget } from 'three'
import {
  BlendFunction,
  EffectComposer,
  DepthOfFieldEffect,
  OutlineEffect,
  DepthDownsamplingPass,
  EffectPass,
  NormalPass,
  RenderPass,
  SSAOEffect,
  TextureEffect
} from 'postprocessing'
import PostProcessing, { effectType } from '../../scene/classes/PostProcessing'

/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */

export default function configurePostProcessing(node: PostProcessing, scene, camera, renderer, isRemoved = false) {
  if (!node.visible || isRemoved) return null
  const composer = new EffectComposer(renderer)
  const renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)
  const passes: any[] = []
  const normalPass = new NormalPass(scene, camera, {
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
  const normalDepthBuffer = depthDownsamplingPass.texture
  let pass
  Object.keys(node.postProcessingOptions).forEach((key: any) => {
    pass = node.postProcessingOptions[key]
    const effect = effectType[key].effect

    if (pass.isActive)
      if (effect === SSAOEffect) {
        passes.push(new effect(camera, normalPass.texture, { ...pass, normalDepthBuffer }))
      } else if (effect === DepthOfFieldEffect) passes.push(new effect(camera, pass))
      else if (effect === OutlineEffect) {
        const eff = new effect(scene, camera, pass)
        passes.push(eff)
        composer.OutlineEffect = eff
      } else passes.push(new effect(pass))
  })
  const textureEffect = new TextureEffect({
    blendFunction: BlendFunction.SKIP,
    texture: depthDownsamplingPass.texture
  })
  if (passes.length) {
    composer.addPass(depthDownsamplingPass)
    composer.addPass(new EffectPass(camera, ...passes, textureEffect))
  }
  return composer
}
