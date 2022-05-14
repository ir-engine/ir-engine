import { BlendFunction, DepthDownsamplingPass, EffectPass, NormalPass, RenderPass, TextureEffect } from 'postprocessing'
import { NearestFilter, RGBAFormat, WebGLRenderTarget } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { getAllComponentsOfType } from '../../ecs/functions/ComponentFunctions'
import { PostprocessingComponent } from '../../scene/components/PostprocessingComponent'
import { EffectMap, Effects, OutlineEffectProps } from '../../scene/constants/PostProcessing'
import { accessEngineRendererState } from '../EngineRendererState'
import { EngineRenderer } from '../WebGLRendererSystem'
import { changeRenderMode } from './changeRenderMode'

export const configureEffectComposer = (remove?: boolean): void => {
  EngineRenderer.instance.effectComposer.removeAllPasses()

  // we always want to have at least the render pass enabled
  const renderPass = new RenderPass(Engine.instance.currentWorld.scene, Engine.instance.currentWorld.camera)
  EngineRenderer.instance.effectComposer.addPass(renderPass)

  if (remove) {
    return
  }

  const comps = getAllComponentsOfType(PostprocessingComponent)

  if (!comps.length) return
  const postProcessing = comps[0]

  const effects: any[] = []
  const effectKeys = EffectMap.keys()

  const normalPass = new NormalPass(Engine.instance.currentWorld.scene, Engine.instance.currentWorld.camera, {
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
    const effect = postProcessing.options[key]

    if (!effect || !effect.isActive) continue
    const effectClass = EffectMap.get(key)?.EffectClass

    if (!effectClass) return

    if (key === Effects.SSAOEffect) {
      const eff = new effectClass(Engine.instance.currentWorld.camera, normalPass.texture, {
        ...effect,
        normalDepthBuffer: depthDownsamplingPass.texture
      })
      EngineRenderer.instance.effectComposer[key] = eff
      effects.push(eff)
    } else if (key === Effects.DepthOfFieldEffect) {
      const eff = new effectClass(Engine.instance.currentWorld.camera, effect)
      EngineRenderer.instance.effectComposer[key] = eff
      effects.push(eff)
    } else if (key === Effects.OutlineEffect) {
      let outlineEffect = effect as OutlineEffectProps
      if (Engine.instance.isEditor) {
        outlineEffect = { ...outlineEffect, hiddenEdgeColor: 0x22090a }
      }
      const eff = new effectClass(
        Engine.instance.currentWorld.scene,
        Engine.instance.currentWorld.camera,
        outlineEffect
      )
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
    EngineRenderer.instance.effectComposer.addPass(
      new EffectPass(Engine.instance.currentWorld.camera, ...effects, textureEffect)
    )
  }

  if (Engine.instance.isEditor) changeRenderMode(accessEngineRendererState().renderMode.value)
}
