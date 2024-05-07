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

import { Engine, defineComponent, useComponent, useEntityContext } from '@etherealengine/ecs'
import { useTexture } from '@etherealengine/engine/src/assets/functions/resourceHooks'
import { NO_PROXY_STEALTH, getState, none, useHookstate } from '@etherealengine/hyperflux'
import {
  DepthDownsamplingPass,
  EdgeDetectionMode,
  Effect,
  EffectComposer,
  EffectPass,
  OutlineEffect,
  RenderPass,
  SMAAEffect
} from 'postprocessing'
import { useEffect } from 'react'
import { VelocityDepthNormalPass } from 'realism-effects'
import { Scene } from 'three'
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
    const rendererEntity = useScene(Engine.instance.viewerEntity)
    const postprocessingComponent = useComponent(entity, PostProcessingComponent)
    const camera = useComponent(rendererEntity, CameraComponent)
    const renderer = useComponent(rendererEntity, RendererComponent)

    let lut1DEffectTexturePath: string | undefined
    if (
      postprocessingComponent.effects[Effects.LUT1DEffect].lutPath &&
      postprocessingComponent.effects[Effects.LUT1DEffect].isActive.value
    ) {
      lut1DEffectTexturePath = postprocessingComponent.effects[Effects.LUT1DEffect].lutPath.value
    }
    let lut3DEffectTexturePath: string | undefined
    if (
      postprocessingComponent.effects[Effects.LUT3DEffect].lutPath &&
      postprocessingComponent.effects[Effects.LUT3DEffect].isActive.value
    ) {
      lut3DEffectTexturePath = postprocessingComponent.effects[Effects.LUT3DEffect].lutPath.value
    }
    let textureEffectTexturePath: string | undefined
    if (
      postprocessingComponent.effects[Effects.TextureEffect].texturePath &&
      postprocessingComponent.effects[Effects.TextureEffect].isActive.value
    ) {
      textureEffectTexturePath = postprocessingComponent.effects[Effects.TextureEffect].texturePath.value
    }

    const [lut1DEffectTexture, lut1DEffectTextureError] = useTexture(lut1DEffectTexturePath!, entity)
    const [lut3DEffectTexture, lut3DEffectTextureError] = useTexture(lut3DEffectTexturePath!, entity)
    const [textureEffectTexture, textureEffectTextureError] = useTexture(textureEffectTexturePath!, entity)

    const scene = useHookstate<Scene>(() => new Scene())
    const normalPass = useHookstate<CustomNormalPass>(() => new CustomNormalPass(scene, camera))
    const depthDownsamplingPass = useHookstate<DepthDownsamplingPass>(
      () =>
        new DepthDownsamplingPass({
          normalBuffer: normalPass.value.texture,
          resolutionScale: 0.5
        })
    )
    const velocityDepthNormalPass = useHookstate(new VelocityDepthNormalPass(scene, camera))
    const useVelocityDepthNormalPass = useHookstate(false)
    const useDepthDownsamplingPass = useHookstate(false)

    const composer = useHookstate<EffectComposer>(() => new EffectComposer(renderer.value.renderer))
    const effects = useHookstate<Record<string, Effect>>({})

    useEffect(() => {
      velocityDepthNormalPass.set(new VelocityDepthNormalPass(scene, camera))
    }, [scene])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.BloomEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.BloomEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.BloomEffect].set(eff)
        effects[Effects.BloomEffect].set(eff)

        return () => {
          composer[Effects.BloomEffect].set(none)
          effects[Effects.BloomEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects.BloomEffect])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.BrightnessContrastEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.BrightnessContrastEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.BrightnessContrastEffect].set(eff)
        effects[Effects.BrightnessContrastEffect].set(eff)

        return () => {
          composer[Effects.BrightnessContrastEffect].set(none)
          effects[Effects.BrightnessContrastEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.BrightnessContrastEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.ChromaticAberrationEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.ChromaticAberrationEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.ChromaticAberrationEffect].set(eff)
        effects[Effects.ChromaticAberrationEffect].set(eff)

        return () => {
          composer[Effects.ChromaticAberrationEffect].set(none)
          effects[Effects.ChromaticAberrationEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.ChromaticAberrationEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.ColorAverageEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.ColorAverageEffect]
        const eff = new EffectClass(effectOptions.blendFunction)
        composer[Effects.ColorAverageEffect].set(eff)
        effects[Effects.ColorAverageEffect].set(eff)

        return () => {
          composer[Effects.ColorAverageEffect].set(none)
          effects[Effects.ColorAverageEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.ColorAverageEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.ColorDepthEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.ColorDepthEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.ColorDepthEffect].set(eff)
        effects[Effects.ColorDepthEffect].set(eff)

        return () => {
          composer[Effects.ColorDepthEffect].set(none)
          effects[Effects.ColorDepthEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.ColorDepthEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.DepthOfFieldEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.DepthOfFieldEffect]
        const eff = new EffectClass(camera.value, effectOptions)
        composer[Effects.DepthOfFieldEffect].set(eff)
        effects[Effects.DepthOfFieldEffect].set(eff)

        return () => {
          composer[Effects.DepthOfFieldEffect].set(none)
          effects[Effects.DepthOfFieldEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.DepthOfFieldEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.DotScreenEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.DotScreenEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.DotScreenEffect].set(eff)
        effects[Effects.DotScreenEffect].set(eff)

        return () => {
          composer[Effects.DotScreenEffect].set(none)
          effects[Effects.DotScreenEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.DotScreenEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.FXAAEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.FXAAEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.FXAAEffect].set(eff)
        effects[Effects.FXAAEffect].set(eff)

        return () => {
          composer[Effects.FXAAEffect].set(none)
          effects[Effects.FXAAEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.FXAAEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.GlitchEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.GlitchEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.GlitchEffect].set(eff)
        effects[Effects.GlitchEffect].set(eff)

        return () => {
          composer[Effects.GlitchEffect].set(none)
          effects[Effects.GlitchEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.GlitchEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.GridEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.GridEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.GridEffect].set(eff)
        effects[Effects.GridEffect].set(eff)

        return () => {
          composer[Effects.GridEffect].set(none)
          effects[Effects.GridEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.GridEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.HueSaturationEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.HueSaturationEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.HueSaturationEffect].set(eff)
        effects[Effects.HueSaturationEffect].set(eff)

        return () => {
          composer[Effects.HueSaturationEffect].set(none)
          effects[Effects.HueSaturationEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.HueSaturationEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.LUT1DEffect] as any
      if (effectOptions && effectOptions.isActive.value && lut1DEffectTexture) {
        const EffectClass = EffectMap[Effects.LUT1DEffect]
        const eff = new EffectClass(lut1DEffectTexture, effectOptions)
        composer[Effects.LUT1DEffect].set(eff)
        effects[Effects.LUT1DEffect].set(eff)

        return () => {
          composer[Effects.LUT1DEffect].set(none)
          effects[Effects.LUT1DEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.LUT1DEffect], lut1DEffectTexture, lut1DEffectTextureError])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.LUT3DEffect] as any
      if (effectOptions && effectOptions.isActive.value && lut3DEffectTexture) {
        const EffectClass = EffectMap[Effects.LUT3DEffect]
        const eff = new EffectClass(lut3DEffectTexture, effectOptions)
        composer[Effects.LUT3DEffect].set(eff)
        effects[Effects.LUT3DEffect].set(eff)

        return () => {
          composer[Effects.LUT3DEffect].set(none)
          effects[Effects.LUT3DEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.LUT3DEffect], lut3DEffectTexture, lut3DEffectTextureError])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.LensDistortionEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.LensDistortionEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.LensDistortionEffect].set(eff)
        effects[Effects.LensDistortionEffect].set(eff)

        return () => {
          composer[Effects.LensDistortionEffect].set(none)
          effects[Effects.LensDistortionEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.LensDistortionEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.LinearTosRGBEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.LinearTosRGBEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.LinearTosRGBEffect].set(eff)
        effects[Effects.LinearTosRGBEffect].set(eff)

        return () => {
          composer[Effects.LinearTosRGBEffect].set(none)
          effects[Effects.LinearTosRGBEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.LinearTosRGBEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.MotionBlurEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.MotionBlurEffect]
        const eff = new EffectClass(velocityDepthNormalPass, effectOptions)
        useVelocityDepthNormalPass.set(true)
        composer[Effects.MotionBlurEffect].set(eff)
        effects[Effects.MotionBlurEffect].set(eff)

        return () => {
          composer[Effects.MotionBlurEffect].set(none)
          effects[Effects.MotionBlurEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.MotionBlurEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.NoiseEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.NoiseEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.NoiseEffect].set(eff)
        effects[Effects.NoiseEffect].set(eff)

        return () => {
          composer[Effects.NoiseEffect].set(none)
          effects[Effects.NoiseEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.NoiseEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.OutlineEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.OutlineEffect]
        const eff = new EffectClass(scene.value, camera.value, effectOptions)
        composer[Effects.OutlineEffect].set(eff)
        effects[Effects.OutlineEffect].set(eff)

        return () => {
          composer[Effects.OutlineEffect].set(none)
          effects[Effects.OutlineEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.OutlineEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.PixelationEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.PixelationEffect]
        const eff = new EffectClass(effectOptions.granularity)
        composer[Effects.PixelationEffect].set(eff)
        effects[Effects.PixelationEffect].set(eff)

        return () => {
          composer[Effects.PixelationEffect].set(none)
          effects[Effects.PixelationEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.PixelationEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.SMAAEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.SMAAEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.SMAAEffect].set(eff)
        effects[Effects.SMAAEffect].set(eff)

        return () => {
          composer[Effects.SMAAEffect].set(none)
          effects[Effects.SMAAEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.SMAAEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.SSAOEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.SSAOEffect]
        const eff = new EffectClass(camera.value, normalPass.value.texture, {
          ...effectOptions,
          normalDepthBuffer: depthDownsamplingPass.value.texture
        })
        useDepthDownsamplingPass.set(true)
        composer[Effects.SSAOEffect].set(eff)
        effects[Effects.SSAOEffect].set(eff)

        return () => {
          composer[Effects.SSAOEffect].set(none)
          effects[Effects.SSAOEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.SSAOEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.SSGIEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.SSGIEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.SSGIEffect].set(eff)
        effects[Effects.SSGIEffect].set(eff)

        return () => {
          composer[Effects.SSGIEffect].set(none)
          effects[Effects.SSGIEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.SSGIEffect]])

    // SSR is just a mode of SSGI, and can't both be run at the same time
    useEffect(() => {
      let usingSSGI = false
      const ssgiEffectOptions = postprocessingComponent.effects[Effects.SSGIEffect] as any
      if (ssgiEffectOptions && ssgiEffectOptions.isActive.value) {
        usingSSGI = true
      }
      const effectOptions = postprocessingComponent.effects[Effects.SSREffect] as any
      if (effectOptions && effectOptions.isActive && !usingSSGI) {
        const EffectClass = EffectMap[Effects.SSREffect]
        const eff = new EffectClass(composer, scene, camera.value, { ...effectOptions, velocityDepthNormalPass })
        useVelocityDepthNormalPass.set(true)
        composer[Effects.SSREffect].set(eff)
        effects[Effects.SSREffect].set(eff)

        return () => {
          composer[Effects.SSREffect].set(none)
          effects[Effects.SSREffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.SSREffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.ScanlineEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.ScanlineEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.ScanlineEffect].set(eff)
        effects[Effects.ScanlineEffect].set(eff)

        return () => {
          composer[Effects.ScanlineEffect].set(none)
          effects[Effects.ScanlineEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.ScanlineEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.ShockWaveEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.ShockWaveEffect]
        const eff = new EffectClass(camera.value, effectOptions.position, effectOptions)
        composer[Effects.ShockWaveEffect].set(eff)
        effects[Effects.ShockWaveEffect].set(eff)

        return () => {
          composer[Effects.ShockWaveEffect].set(none)
          effects[Effects.ShockWaveEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.ShockWaveEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.TRAAEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        // todo support more than 1 texture
        const textureCount = 1
        const EffectClass = EffectMap[Effects.TRAAEffect]
        const eff = new EffectClass(scene, camera.value, velocityDepthNormalPass, textureCount, effectOptions)
        useVelocityDepthNormalPass.set(true)
        composer[Effects.TRAAEffect].set(eff)
        effects[Effects.TRAAEffect].set(eff)

        return () => {
          composer[Effects.TRAAEffect].set(none)
          effects[Effects.TRAAEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.TRAAEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.TextureEffect] as any
      if (effectOptions && effectOptions.isActive.value && textureEffectTexture) {
        effectOptions.texture = textureEffectTexture
        const EffectClass = EffectMap[Effects.TextureEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.TextureEffect].set(eff)
        effects[Effects.TextureEffect].set(eff)

        return () => {
          composer[Effects.TextureEffect].set(none)
          effects[Effects.TextureEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.TextureEffect], textureEffectTexture, textureEffectTextureError])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.TiltShiftEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.TiltShiftEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.TiltShiftEffect].set(eff)
        effects[Effects.TiltShiftEffect].set(eff)

        return () => {
          composer[Effects.TiltShiftEffect].set(none)
          effects[Effects.TiltShiftEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.TiltShiftEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.ToneMappingEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.ToneMappingEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.ToneMappingEffect].set(eff)
        effects[Effects.ToneMappingEffect].set(eff)

        return () => {
          composer[Effects.ToneMappingEffect].set(none)
          effects[Effects.ToneMappingEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.ToneMappingEffect]])

    useEffect(() => {
      const effectOptions = postprocessingComponent.effects[Effects.VignetteEffect] as any
      if (effectOptions && effectOptions.isActive.value) {
        const EffectClass = EffectMap[Effects.VignetteEffect]
        const eff = new EffectClass(effectOptions)
        composer[Effects.VignetteEffect].set(eff)
        effects[Effects.VignetteEffect].set(eff)

        return () => {
          composer[Effects.VignetteEffect].set(none)
          effects[Effects.VignetteEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.VignetteEffect]])

    useEffect(() => {
      const effectArray = Object.values(effects.value)
      composer.EffectPass.set(new EffectPass(camera.value, ...effectArray))
      composer.value.addPass(composer.value.EffectPass)
    }, [effects])

    useEffect(() => {
      if (!rendererEntity) return

      let schema = postprocessingComponent.enabled.value
        ? postprocessingComponent.effects.get(NO_PROXY_STEALTH)
        : undefined

      if (!renderer.value || !camera.value) return

      const scene = new Scene()

      if (renderer.value.effectComposer) {
        renderer.value.effectComposer.dispose()
        renderer.value.renderPass = null!
      }

      const composer = new EffectComposer(renderer.value.renderer)
      renderer.value.effectComposer = composer

      // we always want to have at least the render pass enabled
      const renderPass = new RenderPass()
      renderer.value.effectComposer.addPass(renderPass)
      renderer.value.renderPass = renderPass

      const renderSettings = getState(RendererState)
      if (!renderSettings.usePostProcessing) return

      const effects: any[] = []

      const smaaPreset = getState(RenderSettingsState).smaaPreset
      const smaaEffect = new SMAAEffect({
        preset: smaaPreset,
        edgeDetectionMode: EdgeDetectionMode.COLOR
      })
      composer.SMAAEffect = smaaEffect

      const outlineEffect = new OutlineEffect(scene, camera.value, getState(HighlightState))
      outlineEffect.selectionLayer = ObjectLayers.HighlightEffect
      composer.OutlineEffect = outlineEffect

      const SmaaEffectPass = new EffectPass(camera.value, smaaEffect)
      const OutlineEffectPass = new EffectPass(camera.value, outlineEffect)
      composer.addPass(OutlineEffectPass) //outlines don't follow camera
      composer.addPass(SmaaEffectPass)

      /*
      const effectKeys = Object.keys(EffectMap)

      const normalPass = new CustomNormalPass(scene, camera)

      const depthDownsamplingPass = new DepthDownsamplingPass({
        normalBuffer: normalPass.texture,
        resolutionScale: 0.5
      })

      if (!schema) return

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
        } else 
         if (key === Effects.SSREffect || key === Effects.SSGIEffect) {
         SSR is just a mode of SSGI, and can't both be run at the same time
          const eff = new EffectClass(composer, scene, camera, { ...effectOptions, velocityDepthNormalPass })
          useVelocityDepthNormalPass = true
          composer[key] = eff
           effects.push(eff)
        } else 
         if (key === Effects.DepthOfFieldEffect) {
          const eff = new EffectClass(camera, effectOptions)
          composer[key] = eff
          effects.push(eff)
        } else         
        if (key === Effects.TRAAEffect) {
          // todo support more than 1 texture
          const textureCount = 1
          const eff = new EffectClass(scene, camera, velocityDepthNormalPass, textureCount, effectOptions)
          useVelocityDepthNormalPass = true
          composer[key] = eff
          effects.push(eff)
        } else 
        if (key === Effects.MotionBlurEffect) {
          const eff = new EffectClass(velocityDepthNormalPass, effectOptions)
          useVelocityDepthNormalPass = true
          composer[key] = eff
          effects.push(eff)
        } else         
       if (key === Effects.ColorAverageEffect) {
          const eff = new EffectClass(effectOptions.blendFunction)
          composer[key] = eff
          effects.push(eff)
        } else 
        if (key === Effects.OutlineEffect) {
          const eff = new EffectClass(scene, camera, effectOptions)
          composer[key] = eff
          effects.push(eff)
          //} else if (key == Effects.GodRaysEffect) {
          //  const lightsource = null //tbd
          //  const eff = new EffectClass(camera, lightsource, effectOptions)
          //  composer[key] = eff
          //  effects.push(eff)
        } else 
       if (key == Effects.LUT1DEffect) {
          if (lut1DEffectTexture) {
            const eff = new EffectClass(lut1DEffectTexture, effectOptions)
            composer[key] = eff
            effects.push(eff)
          }
        } else        
        if (key == Effects.LUT3DEffect) {
          if (lut3DEffectTexture) {
            const eff = new EffectClass(lut3DEffectTexture, effectOptions)
            composer[key] = eff
            effects.push(eff)
          }
        } else 
       if (key == Effects.PixelationEffect) {
          const eff = new EffectClass(effectOptions.granularity)
          composer[key] = eff
          effects.push(eff)
        } else 
       if (key == Effects.ShockWaveEffect) {
          const eff = new EffectClass(camera, effectOptions.position, effectOptions)
          composer[key] = eff
          effects.push(eff)
        } else 
        if (key == Effects.TextureEffect) {
          if (textureEffectTexture) {
            effectOptions.texture = textureEffectTexture
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
 */
      if (getState(EngineState).isEditor) changeRenderMode()
    }, [
      rendererEntity,
      postprocessingComponent.enabled,
      postprocessingComponent.effects
      //lut1DEffectTexture,
      //lut1DEffectTextureError,
      //lut3DEffectTexture,
      //lut3DEffectTextureError,
      //textureEffectTexture,
      //textureEffectTextureError
    ])

    return null
  }
})
