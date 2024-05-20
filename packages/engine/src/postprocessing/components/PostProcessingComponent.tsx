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
import { useTexture } from '@etherealengine/engine/src/assets/functions/resourceLoaderHooks'
import { NO_PROXY, getState, none, useHookstate } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { HighlightState } from '@etherealengine/spatial/src/renderer/HighlightState'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { RenderSettingsState, RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { useScene } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { LinearTosRGBEffect } from '@etherealengine/spatial/src/renderer/effects/LinearTosRGBEffect'
import { changeRenderMode } from '@etherealengine/spatial/src/renderer/functions/changeRenderMode'
import {
  BloomEffect,
  BrightnessContrastEffect,
  ChromaticAberrationEffect,
  ColorAverageEffect,
  ColorDepthEffect,
  DepthDownsamplingPass,
  DepthOfFieldEffect,
  DotScreenEffect,
  EdgeDetectionMode,
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
import { MotionBlurEffect, SSGIEffect, SSREffect, TRAAEffect, VelocityDepthNormalPass } from 'realism-effects'
import { Scene } from 'three'
import { Effects, defaultPostProcessingSchema } from '../PostProcessing'
import { CustomNormalPass } from '../passes/CustomNormalPass'

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
  const composer = useHookstate<EffectComposer>(() => new EffectComposer(renderer.value.renderer))
  renderer.value.effectComposer = composer.value
  const renderPass = new RenderPass()
  renderer.value.effectComposer.addPass(renderPass)
  renderer.value.renderPass = renderPass

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

  const effects = useHookstate<Record<string, Effect>>({})

  useEffect(() => {
    velocityDepthNormalPass.set(new VelocityDepthNormalPass(scene, camera))
  }, [scene])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.BloomEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new BloomEffect(effectOptions)
      effects[Effects.BloomEffect].set(eff)

      return () => {
        effects[Effects.BloomEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects.BloomEffect])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.BrightnessContrastEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new BrightnessContrastEffect(effectOptions)
      effects[Effects.BrightnessContrastEffect].set(eff)

      return () => {
        effects[Effects.BrightnessContrastEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.BrightnessContrastEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.ChromaticAberrationEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new ChromaticAberrationEffect(effectOptions)
      effects[Effects.ChromaticAberrationEffect].set(eff)

      return () => {
        effects[Effects.ChromaticAberrationEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.ChromaticAberrationEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.ColorAverageEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new ColorAverageEffect(effectOptions.blendFunction)
      effects[Effects.ColorAverageEffect].set(eff)

      return () => {
        effects[Effects.ColorAverageEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.ColorAverageEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.ColorDepthEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new ColorDepthEffect(effectOptions)
      effects[Effects.ColorDepthEffect].set(eff)

      return () => {
        effects[Effects.ColorDepthEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.ColorDepthEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.DepthOfFieldEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new DepthOfFieldEffect(camera.value, effectOptions)
      effects[Effects.DepthOfFieldEffect].set(eff)

      return () => {
        effects[Effects.DepthOfFieldEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.DepthOfFieldEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.DotScreenEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new DotScreenEffect(effectOptions)
      effects[Effects.DotScreenEffect].set(eff)

      return () => {
        effects[Effects.DotScreenEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.DotScreenEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.FXAAEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new FXAAEffect(effectOptions)
      effects[Effects.FXAAEffect].set(eff)

      return () => {
        effects[Effects.FXAAEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.FXAAEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.GlitchEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new GlitchEffect(effectOptions)
      effects[Effects.GlitchEffect].set(eff)

      return () => {
        effects[Effects.GlitchEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.GlitchEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.GridEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new GridEffect(effectOptions)
      effects[Effects.GridEffect].set(eff)

      return () => {
        effects[Effects.GridEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.GridEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.HueSaturationEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new HueSaturationEffect(effectOptions)
      effects[Effects.HueSaturationEffect].set(eff)

      return () => {
        effects[Effects.HueSaturationEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.HueSaturationEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.LUT1DEffect] as any
    if (effectOptions && effectOptions.isActive && lut1DEffectTexture) {
      const eff = new LUT1DEffect(lut1DEffectTexture, effectOptions)
      effects[Effects.LUT1DEffect].set(eff)

      return () => {
        effects[Effects.LUT1DEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.LUT1DEffect], lut1DEffectTexture, lut1DEffectTextureError])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.LUT3DEffect] as any
    if (effectOptions && effectOptions.isActive && lut3DEffectTexture) {
      const eff = new LUT3DEffect(lut3DEffectTexture, effectOptions)
      effects[Effects.LUT3DEffect].set(eff)

      return () => {
        effects[Effects.LUT3DEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.LUT3DEffect], lut3DEffectTexture, lut3DEffectTextureError])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.LensDistortionEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new LensDistortionEffect(effectOptions)
      effects[Effects.LensDistortionEffect].set(eff)

      return () => {
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
      effects[Effects.MotionBlurEffect].set(eff)

      return () => {
        effects[Effects.MotionBlurEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.MotionBlurEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.NoiseEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new NoiseEffect(effectOptions)
      effects[Effects.NoiseEffect].set(eff)

      return () => {
        effects[Effects.NoiseEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.NoiseEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.PixelationEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new PixelationEffect(effectOptions.granularity)
      effects[Effects.PixelationEffect].set(eff)

      return () => {
        effects[Effects.PixelationEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.PixelationEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.SMAAEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new SMAAEffect(effectOptions)
      effects[Effects.SMAAEffect].set(eff)

      return () => {
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
      effects[Effects.SSAOEffect].set(eff)

      return () => {
        effects[Effects.SSAOEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.SSAOEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.SSGIEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new SSGIEffect(effectOptions)
      effects[Effects.SSGIEffect].set(eff)

      return () => {
        effects[Effects.SSGIEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.SSGIEffect]])

  // SSR is just a mode of SSGI, and can't both be run at the same time
  useEffect(() => {
    let usingSSGI = false

    const ssgiEffectOptions = postprocessingComponent.value.effects[Effects.SSGIEffect] as any
    if (ssgiEffectOptions && ssgiEffectOptions.isActive) {
      usingSSGI = true
    }

    const effectOptions = postprocessingComponent.value.effects[Effects.SSREffect] as any
    if (effectOptions && effectOptions.isActive && !usingSSGI) {
      const eff = new SSREffect(composer, scene, camera.value, { ...effectOptions, velocityDepthNormalPass })
      useVelocityDepthNormalPass.set(true)
      effects[Effects.SSREffect].set(eff)

      return () => {
        effects[Effects.SSREffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.SSREffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.ScanlineEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new ScanlineEffect(effectOptions)
      effects[Effects.ScanlineEffect].set(eff)

      return () => {
        effects[Effects.ScanlineEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.ScanlineEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.ShockWaveEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new ShockWaveEffect(camera.value, effectOptions.position, effectOptions)
      effects[Effects.ShockWaveEffect].set(eff)

      return () => {
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
      effects[Effects.TRAAEffect].set(eff)

      return () => {
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
      effects[Effects.TiltShiftEffect].set(eff)

      return () => {
        effects[Effects.TiltShiftEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.TiltShiftEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.ToneMappingEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new ToneMappingEffect(effectOptions)
      effects[Effects.ToneMappingEffect].set(eff)

      return () => {
        effects[Effects.ToneMappingEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.ToneMappingEffect]])

  useEffect(() => {
    const effectOptions = postprocessingComponent.value.effects[Effects.VignetteEffect] as any
    if (effectOptions && effectOptions.isActive) {
      const eff = new VignetteEffect(effectOptions)
      effects[Effects.VignetteEffect].set(eff)

      return () => {
        effects[Effects.VignetteEffect].set(none)
      }
    }
  }, [postprocessingComponent.effects[Effects.VignetteEffect]])

  useEffect(() => {
    const renderSettings = getState(RendererState)

    const effectsVal = effects.get(NO_PROXY)

    if (renderSettings.usePostProcessing) {
      for (const key in effectsVal) {
        const val = effectsVal[key]
        composer.value[key] = val
      }
    }

    //always have the smaa effect
    const smaaPreset = getState(RenderSettingsState).smaaPreset
    const smaaEffect = new SMAAEffect({
      preset: smaaPreset,
      edgeDetectionMode: EdgeDetectionMode.COLOR
    })

    //always have the outline effect for the highlight selection
    const outlineEffect = new OutlineEffect(scene.value, camera.value, getState(HighlightState))
    outlineEffect.selectionLayer = ObjectLayers.HighlightEffect
    effectsVal[Effects.OutlineEffect] = outlineEffect
    composer.value[Effects.OutlineEffect] = outlineEffect

    const effectArray = Object.values(effectsVal)
    composer.value.EffectPass = new EffectPass(camera.value, ...effectArray)
    composer.value.addPass(composer.value.EffectPass)
  }, [effects])

  useEffect(() => {
    if (!rendererEntity) return

    if (getState(EngineState).isEditor) changeRenderMode()
  }, [rendererEntity, postprocessingComponent.enabled, postprocessingComponent.effects])

  return null
}
