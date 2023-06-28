/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { BlendFunction, DepthDownsamplingPass, EffectPass, NormalPass, RenderPass, TextureEffect } from 'postprocessing'
import { VelocityDepthNormalPass } from 'realism-effects'
import { NearestFilter, PerspectiveCamera, RGBAFormat, WebGLRenderTarget } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { EffectMap, EffectPropsSchema, Effects } from '../../scene/constants/PostProcessing'
import { RendererState } from '../RendererState'
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

  const postProcessingEnabled = getState(RendererState).usePostProcessing
  if (!postProcessingEnabled && !getState(EngineState).isEditor) return

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
