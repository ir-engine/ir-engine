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

import { Entity } from '@etherealengine/ecs'
import { getMutableState, getState, none } from '@etherealengine/hyperflux'
import {
  EffectReactorProps,
  PostProcessingEffectState
} from '@etherealengine/spatial/src/renderer/effects/EffectRegistry'
import { ChromaticAberrationEffect } from 'postprocessing'
import React, { useEffect } from 'react'
import { Vector2 } from 'three'

export const Effects = {
  SMAAEffect: 'SMAAEffect' as const,
  OutlineEffect: 'OutlineEffect' as const,
  SSAOEffect: 'SSAOEffect' as const,
  SSREffect: 'SSREffect' as const,
  SSGIEffect: 'SSGIEffect' as const,
  DepthOfFieldEffect: 'DepthOfFieldEffect' as const,
  BloomEffect: 'BloomEffect' as const,
  ToneMappingEffect: 'ToneMappingEffect' as const,
  BrightnessContrastEffect: 'BrightnessContrastEffect' as const,
  HueSaturationEffect: 'HueSaturationEffect' as const,
  ColorDepthEffect: 'ColorDepthEffect' as const,
  LinearTosRGBEffect: 'LinearTosRGBEffect' as const,
  //SSGIEffect: 'SSGIEffect' as const,
  TRAAEffect: 'TRAAEffect' as const,
  ChromaticAberrationEffect: 'ChromaticAberrationEffect' as const,
  MotionBlurEffect: 'MotionBlurEffect' as const,
  ColorAverageEffect: 'ColorAverageEffect' as const,
  DotScreenEffect: 'DotScreenEffect' as const,
  TiltShiftEffect: 'TiltShiftEffect' as const,
  GlitchEffect: 'GlitchEffect' as const,
  //GodRaysEffect: 'GodRaysEffect' as const,
  GridEffect: 'GridEffect' as const,
  LUT1DEffect: 'LUT1DEffect' as const,
  LUT3DEffect: 'LUT3DEffect' as const,
  NoiseEffect: 'NoiseEffect' as const,
  PixelationEffect: 'PixelationEffect' as const,
  ScanlineEffect: 'ScanlineEffect' as const,
  ShockWaveEffect: 'ShockWaveEffect' as const,
  FXAAEffect: 'FXAAEffect' as const,
  TextureEffect: 'TextureEffect' as const,
  VignetteEffect: 'VignetteEffect' as const,
  LensDistortionEffect: 'LensDistortionEffect' as const
}

enum PropertyTypes {
  BlendFunction,
  Number,
  Boolean,
  Color,
  ColorSpace,
  KernelSize,
  SMAAPreset,
  EdgeDetectionMode,
  PredicationMode,
  Texture,
  Vector2,
  Vector3,
  VignetteTechnique
}

const ChromaticAberrationEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
  isActive
  rendererEntity: Entity
  effectData
  effects
}) => {
  const { isActive, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)

  useEffect(() => {
    if (effectData[Effects.ChromaticAberrationEffect].value) return
    effectData[Effects.ChromaticAberrationEffect].set(effectState[Effects.ChromaticAberrationEffect].defaultValues)
  }, [])

  useEffect(() => {
    if (!isActive?.value) {
      if (effects[Effects.ChromaticAberrationEffect].value) effects[Effects.ChromaticAberrationEffect].set(none)
      return
    }
    const eff = new ChromaticAberrationEffect(effectData[Effects.ChromaticAberrationEffect].value)
    effects[Effects.ChromaticAberrationEffect].set(eff)
    return () => {
      effects[Effects.ChromaticAberrationEffect].set(none)
    }
  }, [isActive])

  return null
}

export const populateEffectRegistry = () => {
  // registers the effect
  getMutableState(PostProcessingEffectState).merge({
    [Effects.ChromaticAberrationEffect]: {
      reactor: ChromaticAberrationEffectProcessReactor,
      defaultValues: {
        isActive: false,
        offset: new Vector2(1e-3, 5e-4),
        radialModulation: false,
        modulationOffset: 0.15
      },
      schema: {
        offset: { propertyType: PropertyTypes.Vector2, name: 'Offset' },
        radialModulation: { propertyType: PropertyTypes.Boolean, name: 'Radial Modulation' },
        modulationOffset: { propertyType: PropertyTypes.Number, name: 'Modulation Offset', min: 0, max: 10, step: 0.01 }
      }
    }
  })
}
