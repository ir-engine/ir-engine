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

import {
  BlendFunction,
  BloomEffect,
  BrightnessContrastEffect,
  ColorDepthEffect,
  DepthOfFieldEffect,
  EdgeDetectionMode,
  Effect,
  HueSaturationEffect,
  KernelSize,
  OutlineEffect,
  PredicationMode,
  Resolution,
  SMAAEffect,
  SMAAPreset,
  SSAOEffect,
  ToneMappingEffect
} from 'postprocessing'
import { MotionBlurEffect, SSGIEffect, TRAAEffect, VelocityDepthNormalPass } from 'realism-effects'
import { SSREffect } from 'screen-space-reflections'
import { ColorRepresentation, Texture } from 'three'

import { FXAAEffect } from '../../renderer/effects/FXAAEffect'
import { LinearTosRGBEffect } from '../../renderer/effects/LinearTosRGBEffect'

export const Effects = {
  // FXAAEffect = 'FXAAEffect' as const,
  SMAAEffect: 'SMAAEffect' as const,
  OutlineEffect: 'OutlineEffect' as const,
  SSAOEffect: 'SSAOEffect' as const,
  SSREffect: 'SSREffect' as const,
  DepthOfFieldEffect: 'DepthOfFieldEffect' as const,
  BloomEffect: 'BloomEffect' as const,
  ToneMappingEffect: 'ToneMappingEffect' as const,
  BrightnessContrastEffect: 'BrightnessContrastEffect' as const,
  HueSaturationEffect: 'HueSaturationEffect' as const,
  ColorDepthEffect: 'ColorDepthEffect' as const,
  LinearTosRGBEffect: 'LinearTosRGBEffect' as const,
  SSGIEffect: 'SSGIEffect' as const,
  TRAAEffect: 'TRAAEffect' as const,
  MotionBlurEffect: 'MotionBlurEffect' as const
}

export const EffectMap = {
  // TODO: FXAA recently broke due to new threejs & postprocessing version #5568
  // EffectMap.set(Effects.FXAAEffect, FXAAEffect)
  [Effects.SMAAEffect]: SMAAEffect,
  [Effects.OutlineEffect]: OutlineEffect,
  [Effects.SSAOEffect]: SSAOEffect,
  [Effects.SSREffect]: SSREffect,
  [Effects.DepthOfFieldEffect]: DepthOfFieldEffect,
  [Effects.BloomEffect]: BloomEffect,
  [Effects.ToneMappingEffect]: ToneMappingEffect,
  [Effects.BrightnessContrastEffect]: BrightnessContrastEffect,
  [Effects.HueSaturationEffect]: HueSaturationEffect,
  [Effects.ColorDepthEffect]: ColorDepthEffect,
  [Effects.LinearTosRGBEffect]: LinearTosRGBEffect,
  [Effects.SSGIEffect]: SSGIEffect,
  [Effects.TRAAEffect]: TRAAEffect,
  [Effects.MotionBlurEffect]: MotionBlurEffect
}

export type EffectMapType = (typeof EffectMap)[keyof typeof EffectMap]

export type EffectProps = {
  isActive: boolean
  blendFunction?: BlendFunction
}

export type FXAAEffectProps = EffectProps

export type SMAAEffectProps = EffectProps & {
  preset: SMAAPreset
  edgeDetectionMode: EdgeDetectionMode
  predicationMode: PredicationMode
}

export type OutlineEffectProps = EffectProps & {
  patternTexture: Texture | null
  edgeStrength: number
  pulseSpeed: number
  visibleEdgeColor: ColorRepresentation
  hiddenEdgeColor: ColorRepresentation
  resolutionScale: number
  width: number
  height: number
  kernelSize: number
  blur: boolean
  xRay: boolean
  opacity: number
}

export type SSAOEffectProps = EffectProps & {
  distanceScaling: boolean
  depthAwareUpsampling: boolean
  samples: number
  rings: number
  distanceThreshold: number // Render up to a distance of ~20 world units
  distanceFalloff: number // with an additional ~2.5 units of falloff.
  minRadiusScale: number
  bias: number
  radius: number
  intensity: number
  fade: number
}

const defaultSSROptions = {
  intensity: 1,
  exponent: 1,
  distance: 10,
  fade: 0,
  roughnessFade: 1,
  thickness: 10,
  ior: 1.45,
  maxRoughness: 1,
  maxDepthDifference: 10,
  blend: 0,
  correction: 1,
  correctionRadius: 1,
  blur: 0.5,
  blurKernel: 1,
  blurSharpness: 10,
  jitter: 0,
  jitterRoughness: 0,
  steps: 20,
  refineSteps: 5,
  missedRays: true,
  useNormalMap: true,
  useRoughnessMap: true,
  resolutionScale: 1,
  velocityResolutionScale: 1
}

export type SSREffectProps = EffectProps & typeof defaultSSROptions

export type DepthOfFieldEffectProps = EffectProps & {
  focusDistance: number
  focalLength: number
  bokehScale: number
}

export type BloomEffectProps = EffectProps & {
  kernelSize: number
  luminanceThreshold: number
  luminanceSmoothing: number
  intensity: number
}

export type ToneMappingEffectProps = EffectProps & {
  adaptive: boolean
  resolution: number
  middleGrey: number
  maxLuminance: number
  averageLuminance: number
  adaptationRate: number
}

export type BrightnessContrastEffectProps = EffectProps & {
  brightness: number
  contrast: number
}

export type HueSaturationEffectProps = EffectProps & {
  hue: number
  saturation: number
}

export type ColorDepthEffectProps = EffectProps & {
  bits: number
}

export type LinearTosRGBEffectProps = EffectProps

export type SSGIEffectProps = EffectProps & {
  distance: number
  thickness: number
  autoThickness: boolean
  maxRoughness: number
  blend: number
  denoiseIterations: number
  denoiseKernel: number
  denoiseDiffuse: number
  denoiseSpecular: number
  depthPhi: number
  normalPhi: number
  roughnessPhi: number
  envBlur: number
  importanceSampling: boolean
  directLightMultiplier: number
  steps: number
  refineSteps: number
  spp: number
  resolutionScale: number
  missedRays: boolean
}

export type TRAAEffectProps = EffectProps & {
  blend: number
  constantBlend: boolean
  dilation: boolean
  blockySampling: boolean
  logTransform: boolean
  depthDistance: number
  worldDistance: number
  neighborhoodClamping: boolean
}

export type MotionBlurEffectProps = EffectProps & {
  intensity: 1
  jitter: 1
  samples: 16
}

export type EffectPropsSchema = {
  // [Effects.FXAAEffect]: FXAAEffectProps
  [Effects.SMAAEffect]: SMAAEffectProps
  [Effects.OutlineEffect]: OutlineEffectProps
  [Effects.SSAOEffect]: SSAOEffectProps
  [Effects.SSREffect]: SSREffectProps
  [Effects.DepthOfFieldEffect]: DepthOfFieldEffectProps
  [Effects.BloomEffect]: BloomEffectProps
  [Effects.ToneMappingEffect]: ToneMappingEffectProps
  [Effects.BrightnessContrastEffect]: BrightnessContrastEffectProps
  [Effects.HueSaturationEffect]: HueSaturationEffectProps
  [Effects.ColorDepthEffect]: ColorDepthEffectProps
  [Effects.LinearTosRGBEffect]: LinearTosRGBEffectProps
  [Effects.SSGIEffect]: SSGIEffectProps
  [Effects.TRAAEffect]: TRAAEffectProps
  [Effects.MotionBlurEffect]: MotionBlurEffectProps
}

export const defaultPostProcessingSchema: EffectPropsSchema = {
  // FXAAEffect: {
  //   isActive: true,
  //   blendFunction: BlendFunction.NORMAL
  // },
  [Effects.SMAAEffect]: {
    isActive: true,
    blendFunction: BlendFunction.NORMAL,
    preset: SMAAPreset.MEDIUM,
    edgeDetectionMode: EdgeDetectionMode.COLOR,
    predicationMode: PredicationMode.DISABLED
  },
  [Effects.OutlineEffect]: {
    isActive: true,
    blendFunction: BlendFunction.SCREEN,
    patternTexture: null,
    edgeStrength: 2.0,
    pulseSpeed: 0.25,
    visibleEdgeColor: 0xffffff,
    hiddenEdgeColor: 0xffffff,
    resolutionScale: 0.5,
    width: Resolution.AUTO_SIZE,
    height: Resolution.AUTO_SIZE,
    kernelSize: KernelSize.MEDIUM,
    blur: false,
    xRay: true,
    opacity: 0.5
  },
  [Effects.SSAOEffect]: {
    isActive: false,
    blendFunction: BlendFunction.MULTIPLY,
    distanceScaling: true,
    depthAwareUpsampling: true,
    samples: 16,
    rings: 7,
    distanceThreshold: 0.125, // Render up to a distance of ~20 world units
    distanceFalloff: 0.02, // with an additional ~2.5 units of falloff.
    minRadiusScale: 1,
    bias: 0.25,
    radius: 0.01,
    intensity: 2,
    fade: 0.05
  },
  [Effects.SSREffect]: {
    isActive: false,
    ...defaultSSROptions
  },
  [Effects.DepthOfFieldEffect]: {
    isActive: false,
    blendFunction: BlendFunction.NORMAL,
    focusDistance: 0.02,
    focalLength: 0.5,
    bokehScale: 1
  },
  [Effects.BloomEffect]: {
    isActive: true,
    blendFunction: BlendFunction.SCREEN,
    kernelSize: KernelSize.MEDIUM,
    luminanceThreshold: 1.0,
    luminanceSmoothing: 0.1,
    intensity: 0.2
  },
  [Effects.ToneMappingEffect]: {
    isActive: false,
    blendFunction: BlendFunction.NORMAL,
    adaptive: true,
    resolution: 512,
    middleGrey: 0.6,
    maxLuminance: 32.0,
    averageLuminance: 1.0,
    adaptationRate: 2.0
  },
  [Effects.BrightnessContrastEffect]: {
    isActive: false,
    brightness: 0.05,
    contrast: 0.1
  },
  [Effects.HueSaturationEffect]: {
    isActive: false,
    hue: 0,
    saturation: -0.15
  },
  [Effects.ColorDepthEffect]: {
    isActive: false,
    bits: 16
  },
  [Effects.LinearTosRGBEffect]: {
    isActive: false
  },
  [Effects.SSGIEffect]: {
    isActive: false,
    distance: 10,
    thickness: 10,
    autoThickness: false,
    maxRoughness: 1,
    blend: 0.9,
    denoiseIterations: 1,
    denoiseKernel: 2,
    denoiseDiffuse: 10,
    denoiseSpecular: 10,
    depthPhi: 2,
    normalPhi: 50,
    roughnessPhi: 1,
    envBlur: 0.5,
    importanceSampling: true,
    directLightMultiplier: 1,
    steps: 20,
    refineSteps: 5,
    spp: 1,
    resolutionScale: 1,
    missedRays: false
  },
  [Effects.TRAAEffect]: {
    isActive: false,
    blend: 0.8,
    constantBlend: true,
    dilation: true,
    blockySampling: false,
    logTransform: false, // ! TODO: check if can use logTransform withoutt artifacts
    depthDistance: 10,
    worldDistance: 5,
    neighborhoodClamping: true
  },
  [Effects.MotionBlurEffect]: {
    isActive: false,
    intensity: 1,
    jitter: 1,
    samples: 16
  }
}

/**
 * Based on Unity's post processing pipelines
 * - https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@16.0/manual/Post-Processing-Execution-Order.html
 * - https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@16.0/manual/EffectList.html
 * - https://docs.unity3d.com/Packages/com.unity.render-pipelines.core@16.0/manual
 */

export const effectInOrder = [
  /** 1. input aliasing */
  Effects.SMAAEffect,

  /** 2. world effects */
  // Effects.PaniniProjection,
  Effects.OutlineEffect,
  Effects.DepthOfFieldEffect,
  Effects.SSAOEffect, // TODO- add option to use HBAO
  Effects.SSREffect,
  Effects.SSGIEffect,
  // Effects.GodRaysEffect,

  /** 3. camera effects */
  // Effects.LensDistortionEffect,
  // Effects.LensFlareEffect,
  // Effects.ChromaticAberrationEffect,
  Effects.MotionBlurEffect,
  Effects.BloomEffect,
  // Effects.VignetteEffect,

  /** 4. color grading */
  Effects.ToneMappingEffect,
  // maybe replace with Shadows/Midtones/Highlights ?
  Effects.BrightnessContrastEffect,
  Effects.HueSaturationEffect,
  Effects.ColorDepthEffect,
  // Effects.ColorLUT,
  // Effects.ColorCurvesEffect,
  // Effects.WhiteBalanceEffect,

  /** 5. final fix, aliasing and noise passes */
  // Effects.ChromaticAberrationEffect,
  Effects.LinearTosRGBEffect, // should this just be always on?
  Effects.TRAAEffect // TODO - add option to use FXAA
  // Effects.FilmGrainEffect,
  // Effects.DitheringEffect
]
