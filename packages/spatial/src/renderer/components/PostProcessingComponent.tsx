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

import { Entity, defineComponent, useComponent, useEntityContext } from '@etherealengine/ecs'
import { useTexture } from '@etherealengine/engine/src/assets/functions/resourceHooks'
import { NO_PROXY, getState, none, useHookstate } from '@etherealengine/hyperflux'
import {
  BloomEffect,
  BrightnessContrastEffect,
  ChromaticAberrationEffect,
  ColorAverageEffect,
  ColorDepthEffect,
  DepthDownsamplingPass,
  DepthOfFieldEffect,
  DotScreenEffect,
  Effect,
  EffectComposer,
  EffectPass,
  FXAAEffect,
  GlitchEffect,
  //GodRaysEffect,
  GridEffect,
  HueSaturationEffect,
  LUT1DEffect,
  LUT3DEffect,
  LensDistortionEffect,
  NoiseEffect,
  OutlineEffect,
  PixelationEffect,
  RenderPass,
  SMAAEffect,
  SSAOEffect,
  ScanlineEffect,
  ShockWaveEffect,
  TextureEffect,
  TiltShiftEffect,
  ToneMappingEffect,
  VignetteEffect
} from 'postprocessing'
import React, { useEffect } from 'react'
import { MotionBlurEffect, TRAAEffect, VelocityDepthNormalPass } from 'realism-effects'
import { Scene } from 'three'
import { EngineState } from '../../EngineState'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { LinearTosRGBEffect } from '../../renderer/effects/LinearTosRGBEffect'
import { RendererState } from '../RendererState'
import { RendererComponent } from '../WebGLRendererSystem'
import { Effects, defaultPostProcessingSchema } from '../effects/PostProcessing'
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

    if (!rendererEntity) return null

    return <RendererReactor entity={entity} rendererEntity={rendererEntity} />
  }
})

const RendererReactor = (props: { entity: Entity; rendererEntity: Entity }) => {
  const { entity, rendererEntity } = props

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

  //const composer = useHookstate<EffectComposer>(() => new EffectComposer(renderer.value.renderer))
  const effects = useHookstate<Record<string, Effect>>({})

  useEffect(() => {
    velocityDepthNormalPass.set(new VelocityDepthNormalPass(scene, camera))
  }, [scene])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.BloomEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new BloomEffect(effectOptions)
      //composer[Effects.BloomEffect].set(eff)
      effects[Effects.BloomEffect].set(eff)

      return () => {
        //composer[Effects.BloomEffect].set(none)
        effects[Effects.BloomEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects.BloomEffect])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.BrightnessContrastEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new BrightnessContrastEffect(effectOptions)
      //composer[Effects.BrightnessContrastEffect].set(eff)
      effects[Effects.BrightnessContrastEffect].set(eff)

      return () => {
        //composer[Effects.BrightnessContrastEffect].set(none)
        effects[Effects.BrightnessContrastEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.BrightnessContrastEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.ChromaticAberrationEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new ChromaticAberrationEffect(effectOptions)
      //composer[Effects.ChromaticAberrationEffect].set(eff)
      effects[Effects.ChromaticAberrationEffect].set(eff)

      return () => {
        //composer[Effects.ChromaticAberrationEffect].set(none)
        effects[Effects.ChromaticAberrationEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.ChromaticAberrationEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.ColorAverageEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new ColorAverageEffect(effectOptions.blendFunction)
      //composer[Effects.ColorAverageEffect].set(eff)
      effects[Effects.ColorAverageEffect].set(eff)

      return () => {
        //composer[Effects.ColorAverageEffect].set(none)
        effects[Effects.ColorAverageEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.ColorAverageEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.ColorDepthEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new ColorDepthEffect(effectOptions)
      //composer[Effects.ColorDepthEffect].set(eff)
      effects[Effects.ColorDepthEffect].set(eff)

      return () => {
        //composer[Effects.ColorDepthEffect].set(none)
        effects[Effects.ColorDepthEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.ColorDepthEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.DepthOfFieldEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new DepthOfFieldEffect(camera.value, effectOptions)
      //composer[Effects.DepthOfFieldEffect].set(eff)
      effects[Effects.DepthOfFieldEffect].set(eff)

      return () => {
        //composer[Effects.DepthOfFieldEffect].set(none)
        effects[Effects.DepthOfFieldEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.DepthOfFieldEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.DotScreenEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new DotScreenEffect(effectOptions)
      //composer[Effects.DotScreenEffect].set(eff)
      effects[Effects.DotScreenEffect].set(eff)

      return () => {
        //composer[Effects.DotScreenEffect].set(none)
        effects[Effects.DotScreenEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.DotScreenEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.FXAAEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new FXAAEffect(effectOptions)
      //composer[Effects.FXAAEffect].set(eff)
      effects[Effects.FXAAEffect].set(eff)

      return () => {
        //composer[Effects.FXAAEffect].set(none)
        effects[Effects.FXAAEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.FXAAEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.GlitchEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new GlitchEffect(effectOptions)
      //composer[Effects.GlitchEffect].set(eff)
      effects[Effects.GlitchEffect].set(eff)

      return () => {
        //composer[Effects.GlitchEffect].set(none)
        effects[Effects.GlitchEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.GlitchEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.GridEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new GridEffect(effectOptions)
      //composer[Effects.GridEffect].set(eff)
      effects[Effects.GridEffect].set(eff)

      return () => {
        //composer[Effects.GridEffect].set(none)
        effects[Effects.GridEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.GridEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.HueSaturationEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new HueSaturationEffect(effectOptions)
      //composer[Effects.HueSaturationEffect].set(eff)
      effects[Effects.HueSaturationEffect].set(eff)

      return () => {
        //composer[Effects.HueSaturationEffect].set(none)
        effects[Effects.HueSaturationEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.HueSaturationEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.LUT1DEffect] as any
    if (effectOptions && effectOptions.isActive && lut1DEffectTexture) {
      const eff = new LUT1DEffect(lut1DEffectTexture, effectOptions)
      //composer[Effects.LUT1DEffect].set(eff)
      effects[Effects.LUT1DEffect].set(eff)

      return () => {
        //composer[Effects.LUT1DEffect].set(none)
        effects[Effects.LUT1DEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.LUT1DEffect], lut1DEffectTexture, lut1DEffectTextureError])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.LUT3DEffect] as any
    if (effectOptions && effectOptions.isActive && lut3DEffectTexture) {
      const eff = new LUT3DEffect(lut3DEffectTexture, effectOptions)
      //composer[Effects.LUT3DEffect].set(eff)
      effects[Effects.LUT3DEffect].set(eff)

      return () => {
        //composer[Effects.LUT3DEffect].set(none)
        effects[Effects.LUT3DEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.LUT3DEffect], lut3DEffectTexture, lut3DEffectTextureError])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.LensDistortionEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new LensDistortionEffect(effectOptions)
      //composer[Effects.LensDistortionEffect].set(eff)
      effects[Effects.LensDistortionEffect].set(eff)

      return () => {
        //composer[Effects.LensDistortionEffect].set(none)
        effects[Effects.LensDistortionEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.LensDistortionEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.LinearTosRGBEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new LinearTosRGBEffect(effectOptions)
      //composer[Effects.LinearTosRGBEffect].set(eff)
      effects[Effects.LinearTosRGBEffect].set(eff)

      return () => {
        //composer[Effects.LinearTosRGBEffect].set(none)
        effects[Effects.LinearTosRGBEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.LinearTosRGBEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.MotionBlurEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new MotionBlurEffect(velocityDepthNormalPass, effectOptions)
      useVelocityDepthNormalPass.set(true)
      //composer[Effects.MotionBlurEffect].set(eff)
      effects[Effects.MotionBlurEffect].set(eff)

      return () => {
        //composer[Effects.MotionBlurEffect].set(none)
        effects[Effects.MotionBlurEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.MotionBlurEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.NoiseEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new NoiseEffect(effectOptions)
      //composer[Effects.NoiseEffect].set(eff)
      effects[Effects.NoiseEffect].set(eff)

      return () => {
        //composer[Effects.NoiseEffect].set(none)
        effects[Effects.NoiseEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.NoiseEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.OutlineEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new OutlineEffect(scene.value, camera.value, effectOptions)
      //composer[Effects.OutlineEffect].set(eff)
      effects[Effects.OutlineEffect].set(eff)

      return () => {
        //composer[Effects.OutlineEffect].set(none)
        effects[Effects.OutlineEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.OutlineEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.PixelationEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new PixelationEffect(effectOptions.granularity)
      //composer[Effects.PixelationEffect].set(eff)
      effects[Effects.PixelationEffect].set(eff)

      return () => {
        //composer[Effects.PixelationEffect].set(none)
        effects[Effects.PixelationEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.PixelationEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.SMAAEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new SMAAEffect(effectOptions)
      //composer[Effects.SMAAEffect].set(eff)
      effects[Effects.SMAAEffect].set(eff)

      return () => {
        //composer[Effects.SMAAEffect].set(none)
        effects[Effects.SMAAEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.SMAAEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.SSAOEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new SSAOEffect(camera.value, normalPass.value.texture, {
        ...effectOptions,
        normalDepthBuffer: depthDownsamplingPass.value.texture
      })
      useDepthDownsamplingPass.set(true)
      //composer[Effects.SSAOEffect].set(eff)
      effects[Effects.SSAOEffect].set(eff)

      return () => {
        //composer[Effects.SSAOEffect].set(none)
        effects[Effects.SSAOEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.SSAOEffect]])
  /*
    useEffect(() => {
      const effectOptions = postprocessingComponent.value.effects[Effects.SSGIEffect] as any
      if (effectOptions && effectOptions.isActive) {
        const eff = new SSGIEffect(effectOptions)
        //composer[Effects.SSGIEffect].set(eff)
        effects[Effects.SSGIEffect].set(eff)

        return () => {
          //composer[Effects.SSGIEffect].set(none)
          effects[Effects.SSGIEffect].set(none)
        }
      }
    }, [postprocessingComponent.effects[Effects.SSGIEffect]])
*/

  // SSR is just a mode of SSGI, and can't both be run at the same time
  useEffect(() => {
    let usingSSGI = false
    /*
      const ssgiEffectOptions = postprocessingComponent.value.effects[Effects.SSGIEffect] as any
      if (ssgiEffectOptions && ssgiEffectOptions.isActive) {
        usingSSGI = true
      }
      */
    const effectOptions = postprocessingComponent.value.effects[Effects.SSREffect] as any
    if (effectOptions && effectOptions && !usingSSGI) {
      //const eff = new SSREffect(composer, scene, camera.value, { ...effectOptions, velocityDepthNormalPass })
      useVelocityDepthNormalPass.set(true)
      //composer[Effects.SSREffect].set(eff)
      //effects[Effects.SSREffect].set(eff)

      return () => {
        //composer[Effects.SSREffect].set(none)
        effects[Effects.SSREffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.SSREffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.ScanlineEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new ScanlineEffect(effectOptions)
      //composer[Effects.ScanlineEffect].set(eff)
      effects[Effects.ScanlineEffect].set(eff)

      return () => {
        //composer[Effects.ScanlineEffect].set(none)
        effects[Effects.ScanlineEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.ScanlineEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.ShockWaveEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new ShockWaveEffect(camera.value, effectOptions.position, effectOptions)
      //composer[Effects.ShockWaveEffect].set(eff)
      effects[Effects.ShockWaveEffect].set(eff)

      return () => {
        //composer[Effects.ShockWaveEffect].set(none)
        effects[Effects.ShockWaveEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.ShockWaveEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.TRAAEffect] as any
    if (effectOptions && effectOptions.isActive) {
      // todo support more than 1 texture
      const textureCount = 1
      const eff = new TRAAEffect(scene, camera.value, velocityDepthNormalPass, textureCount, effectOptions)
      useVelocityDepthNormalPass.set(true)
      //composer[Effects.TRAAEffect].set(eff)
      effects[Effects.TRAAEffect].set(eff)

      return () => {
        //composer[Effects.TRAAEffect].set(none)
        effects[Effects.TRAAEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.TRAAEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.TextureEffect] as any
    if (effectOptions && effectOptions.isActive && textureEffectTexture) {
      effectOptions.texture = textureEffectTexture
      const eff = new TextureEffect(effectOptions)
      //composer[Effects.TextureEffect].set(eff)
      effects[Effects.TextureEffect].set(eff)

      return () => {
        //composer[Effects.TextureEffect].set(none)
        effects[Effects.TextureEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.TextureEffect], textureEffectTexture, textureEffectTextureError])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.TiltShiftEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new TiltShiftEffect(effectOptions)
      //composer[Effects.TiltShiftEffect].set(eff)
      effects[Effects.TiltShiftEffect].set(eff)

      return () => {
        //composer[Effects.TiltShiftEffect].set(none)
        effects[Effects.TiltShiftEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.TiltShiftEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.ToneMappingEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new ToneMappingEffect(effectOptions)
      //composer[Effects.ToneMappingEffect].set(eff)
      effects[Effects.ToneMappingEffect].set(eff)

      return () => {
        //composer[Effects.ToneMappingEffect].set(none)
        effects[Effects.ToneMappingEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.ToneMappingEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.VignetteEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new VignetteEffect(effectOptions)
      //composer[Effects.VignetteEffect].set(eff)
      effects[Effects.VignetteEffect].set(eff)

      return () => {
        //composer[Effects.VignetteEffect].set(none)
        effects[Effects.VignetteEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.VignetteEffect]])

  useEffect(() => {
    const composer = new EffectComposer(renderer.value.renderer)
    renderer.value.effectComposer = composer

    // we always want to have at least the render pass enabled
    const renderPass = new RenderPass()
    renderer.value.effectComposer.addPass(renderPass)
    renderer.value.renderPass = renderPass

    const renderSettings = getState(RendererState)
    if (!renderSettings.usePostProcessing) return

    const effectsVal = effects.get(NO_PROXY)
    for (const key in effectsVal) {
      const val = effectsVal[key]
      composer[key] = val
    }

    const effectArray = Object.values(effectsVal)
    composer.EffectPass = new EffectPass(camera.value, ...effectArray)
    composer.addPass(composer.EffectPass)
  }, [effects])

  useEffect(() => {
    if (!rendererEntity) return
    /*
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
*/
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
