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

import { defineComponent, getComponent, useComponent, useEntityContext } from '@etherealengine/ecs'
import { NO_PROXY_STEALTH, getState } from '@etherealengine/hyperflux'
import {
  BlendFunction,
  DepthDownsamplingPass,
  EdgeDetectionMode,
  EffectComposer,
  EffectPass,
  OutlineEffect,
  RenderPass,
  SMAAEffect,
  TextureEffect
} from 'postprocessing'
import { useEffect } from 'react'
import { VelocityDepthNormalPass } from 'realism-effects'
import { Scene, Texture, TextureLoader } from 'three'
import { EngineState } from '../../EngineState'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { HighlightState } from '../HighlightState'
import { RendererState } from '../RendererState'
import { RenderSettingsState, RendererComponent } from '../WebGLRendererSystem'
import { ObjectLayers } from '../constants/ObjectLayers'
import { EffectMap, Effects, defaultPostProcessingSchema } from '../effects/PostProcessing'
import { changeRenderMode } from '../functions/changeRenderMode'
import { CustomNormalPass } from '../passes/CustomNormalPass'
import { useScene } from './SceneComponents'

export const PostProcessingComponent = defineComponent({
  name: 'PostProcessingComponent',
  jsonID: 'EE_postprocessing',

  onInit(entity) {
    return {
      enabled: false,
      effects: defaultPostProcessingSchema
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.enabled === 'boolean') component.enabled.set(json.enabled)
    if (typeof json.effects === 'object') component.merge({ effects: json.effects })
  },

  toJSON: (entity, component) => {
    return {
      effects: component.effects.value,
      enabled: component.enabled.value
    }
  },

  /** @todo this will be replaced with spatial queries or distance checks */
  reactor: () => {
    const entity = useEntityContext()
    const rendererEntity = useScene(entity)
    const postprocessingComponent = useComponent(entity, PostProcessingComponent)

    useEffect(() => {
      if (!rendererEntity) return
      //configureEffectComposer(
      //  rendererEntity,
      //  postprocessingComponent.enabled.value ? postprocessingComponent.effects.get(NO_PROXY_STEALTH) : undefined
      //)
      //export const configureEffectComposer = (entity: Entity, schema?: typeof defaultPostProcessingSchema): void => {

      let schema = postprocessingComponent.enabled.value
        ? postprocessingComponent.effects.get(NO_PROXY_STEALTH)
        : undefined

      const renderer = getComponent(rendererEntity, RendererComponent)
      const camera = getComponent(rendererEntity, CameraComponent)
      if (!renderer || !camera) return

      const scene = new Scene()

      if (renderer.effectComposer) {
        renderer.effectComposer.dispose()
        renderer.renderPass = null!
      }

      const composer = new EffectComposer(renderer.renderer)
      renderer.effectComposer = composer

      // we always want to have at least the render pass enabled
      const renderPass = new RenderPass()
      renderer.effectComposer.addPass(renderPass)
      renderer.renderPass = renderPass

      const renderSettings = getState(RendererState)
      if (!renderSettings.usePostProcessing) return

      const effects: any[] = []

      const smaaPreset = getState(RenderSettingsState).smaaPreset
      const smaaEffect = new SMAAEffect({
        preset: smaaPreset,
        edgeDetectionMode: EdgeDetectionMode.COLOR
      })
      composer.SMAAEffect = smaaEffect

      const outlineEffect = new OutlineEffect(scene, camera, getState(HighlightState))
      outlineEffect.selectionLayer = ObjectLayers.HighlightEffect
      composer.OutlineEffect = outlineEffect

      const SmaaEffectPass = new EffectPass(camera, smaaEffect)
      const OutlineEffectPass = new EffectPass(camera, outlineEffect)
      composer.addPass(OutlineEffectPass) //outlines don't follow camera
      composer.addPass(SmaaEffectPass)

      const effectKeys = Object.keys(EffectMap)

      const normalPass = new CustomNormalPass(scene, camera)

      const depthDownsamplingPass = new DepthDownsamplingPass({
        normalBuffer: normalPass.texture,
        resolutionScale: 0.5
      })

      if (!schema) return

      const AddPass = () => {
        if (effects.length) {
          if (useVelocityDepthNormalPass) composer.addPass(velocityDepthNormalPass)

          if (useDepthDownsamplingPass) {
            composer.addPass(normalPass)
            composer.addPass(depthDownsamplingPass)
            const textureEffect = new TextureEffect({
              blendFunction: BlendFunction.SKIP,
              texture: depthDownsamplingPass.texture
            })
            effects.push(textureEffect)
          }

          composer.EffectPass = new EffectPass(camera, ...effects)
          composer.addPass(composer.EffectPass)
        }
      }

      const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera)
      let useVelocityDepthNormalPass = false
      let useDepthDownsamplingPass = false

      for (const key of effectKeys) {
        const effectOptions = schema[key]

        if (!effectOptions || !effectOptions.isActive) continue
        const EffectClass = EffectMap[key]

        if (!EffectClass) continue

        if (key === Effects.SSAOEffect) {
          const eff = new EffectClass(camera, normalPass.texture, {
            ...effectOptions,
            normalDepthBuffer: depthDownsamplingPass.texture
          })
          useDepthDownsamplingPass = true
          composer[key] = eff
          effects.push(eff)
        } else if (key === Effects.SSREffect || key === Effects.SSGIEffect) {
          // SSR is just a mode of SSGI, and can't both be run at the same time
          const eff = new EffectClass(composer, scene, camera, { ...effectOptions, velocityDepthNormalPass })
          useVelocityDepthNormalPass = true
          composer[key] = eff
          effects.push(eff)
        } else if (key === Effects.DepthOfFieldEffect) {
          const eff = new EffectClass(camera, effectOptions)
          composer[key] = eff
          effects.push(eff)
        } else if (key === Effects.TRAAEffect) {
          // todo support more than 1 texture
          const textureCount = 1
          const eff = new EffectClass(scene, camera, velocityDepthNormalPass, textureCount, effectOptions)
          useVelocityDepthNormalPass = true
          composer[key] = eff
          effects.push(eff)
        } else if (key === Effects.MotionBlurEffect) {
          const eff = new EffectClass(velocityDepthNormalPass, effectOptions)
          useVelocityDepthNormalPass = true
          composer[key] = eff
          effects.push(eff)
        } else if (key === Effects.ColorAverageEffect) {
          const eff = new EffectClass(effectOptions.blendFunction)
          composer[key] = eff
          effects.push(eff)
        } else if (key === Effects.OutlineEffect) {
          const eff = new EffectClass(scene, camera, effectOptions)
          composer[key] = eff
          effects.push(eff)
          //} else if (key == Effects.GodRaysEffect) {
          //  const lightsource = null //tbd
          //  const eff = new EffectClass(camera, lightsource, effectOptions)
          //  composer[key] = eff
          //  effects.push(eff)
        } else if (key == Effects.LUT1DEffect) {
          let lutPath = effectOptions.lut
          if (lutPath == undefined) {
            lutPath = null
          }
          let lut: Texture | null = null
          if (lutPath != null) {
            let textLoad = new TextureLoader()
            //have to wait for the texture's image to load and then add the pass to the composer
            lut = textLoad.load(lutPath, (texture) => {
              const eff = new EffectClass(texture, effectOptions)
              composer[key] = eff
              effects.push(eff)
              AddPass()
            })
          } else {
            const eff = new EffectClass(lut, effectOptions)
            composer[key] = eff
            effects.push(eff)
          }
        } else if (key == Effects.LUT3DEffect) {
          let lutPath = effectOptions.lut
          if (lutPath == undefined) {
            lutPath = null
          }
          let lut: Texture | null = null
          if (lutPath != null) {
            let textLoad = new TextureLoader()
            //have to wait for the texture's image to load and then add the pass to the composer
            lut = textLoad.load(lutPath, (texture) => {
              const eff = new EffectClass(texture, effectOptions)
              composer[key] = eff
              effects.push(eff)
              AddPass()
            })
          } else {
            const eff = new EffectClass(lut, effectOptions)
            composer[key] = eff
            effects.push(eff)
          }
        } else if (key == Effects.PixelationEffect) {
          const eff = new EffectClass(effectOptions.granularity)
          composer[key] = eff
          effects.push(eff)
        } else if (key == Effects.ShockWaveEffect) {
          const eff = new EffectClass(camera, effectOptions.position, effectOptions)
          composer[key] = eff
          effects.push(eff)
        } else if (key == Effects.TextureEffect) {
          let texturePath = effectOptions.texturePath
          if (texturePath == undefined) {
            texturePath = null
          }
          let texture: Texture | null = null
          if (texturePath != null) {
            let textLoad = new TextureLoader()
            //have to wait for the texture's image to load and then add the pass to the composer
            texture = textLoad.load(texturePath, (textureLoaded) => {
              effectOptions.texture = textureLoaded
              const eff = new EffectClass(effectOptions)
              composer[key] = eff
              effects.push(eff)
              AddPass()
            })
          } else {
            effectOptions.texture = texture
            const eff = new EffectClass(effectOptions)
            composer[key] = eff
            effects.push(eff)
          }
        } else {
          const eff = new EffectClass(effectOptions)
          composer[key] = eff
          effects.push(eff)
        }
      }
      AddPass()

      if (getState(EngineState).isEditor) changeRenderMode()
    }, [rendererEntity, postprocessingComponent.enabled, postprocessingComponent.effects])

    return null
  }
})
