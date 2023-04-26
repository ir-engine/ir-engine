import { BlendFunction, DepthDownsamplingPass, EffectPass, NormalPass, RenderPass, TextureEffect } from 'postprocessing'
import { VelocityDepthNormalPass } from 'realism-effects'
import { NearestFilter, PerspectiveCamera, RGBAFormat, WebGLRenderTarget } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { EffectMap, EffectPropsSchema, Effects } from '../../scene/constants/PostProcessing'
import { EngineRenderer, PostProcessingSettingsState } from '../WebGLRendererSystem'
import { changeRenderMode } from './changeRenderMode'

export const configureEffectComposer = (remove?: boolean, camera: PerspectiveCamera = Engine.instance.camera): void => {
  if (!EngineRenderer.instance) return

  const scene = Engine.instance.scene

  if (!EngineRenderer.instance.renderPass) {
    // we always want to have at least the render pass enabled
    const renderPass = new RenderPass(scene, camera)
    EngineRenderer.instance.effectComposer.addPass(renderPass)
    EngineRenderer.instance.renderPass = renderPass
  }

  for (const pass of EngineRenderer.instance.effectComposer.passes) {
    if (pass !== EngineRenderer.instance.renderPass) EngineRenderer.instance.effectComposer.removePass(pass)
  }

  if (remove) {
    return
  }

  const postprocessing = getState(PostProcessingSettingsState)
  if (!postprocessing.enabled) return

  const postProcessingEffects = postprocessing.effects as EffectPropsSchema

  const effects: any[] = []
  const effectKeys = EffectMap.keys()

  const composer = EngineRenderer.instance.effectComposer

  const normalPass = new NormalPass(scene, camera, {
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

  const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera)
  let useVelocityDepthNormalPass = false

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
      composer[key] = eff
      effects.push(eff)
    } else if (key === Effects.SSREffect) {
      const eff = new effectClass(scene, camera, effect)
      composer[key] = eff
      effects.push(eff)
    } else if (key === Effects.DepthOfFieldEffect) {
      const eff = new effectClass(camera, effect)
      composer[key] = eff
      effects.push(eff)
    } else if (key === Effects.OutlineEffect) {
      const eff = new effectClass(scene, camera, effect)
      composer[key] = eff
      effects.push(eff)
    } else if (key === Effects.SSGIEffect) {
      const eff = new effectClass(scene, camera, velocityDepthNormalPass, effect)
      useVelocityDepthNormalPass = true
      composer[key] = eff
      effects.push(eff)
    } else if (key === Effects.TRAAEffect) {
      // todo support more than 1 texture
      const textureCount = 1
      const eff = new effectClass(scene, camera, velocityDepthNormalPass, textureCount, effect)
      useVelocityDepthNormalPass = true
      composer[key] = eff
      effects.push(eff)
    } else if (key === Effects.MotionBlurEffect) {
      const eff = new effectClass(velocityDepthNormalPass, effect)
      useVelocityDepthNormalPass = true
      composer[key] = eff
      effects.push(eff)
    } else {
      if (effectClass) {
        const eff = new effectClass(effect)
        composer[key] = eff
        effects.push(eff)
      }
    }
  }

  if (effects.length) {
    const textureEffect = new TextureEffect({
      blendFunction: BlendFunction.SKIP,
      texture: depthDownsamplingPass.texture
    })

    if (useVelocityDepthNormalPass) composer.addPass(velocityDepthNormalPass)

    composer.addPass(depthDownsamplingPass)
    composer.addPass(new EffectPass(camera, ...effects, textureEffect))
  }

  if (getState(EngineState).isEditor) changeRenderMode()
}
