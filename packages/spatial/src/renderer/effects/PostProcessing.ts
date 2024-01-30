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
  BloomEffectOptions,
  BrightnessContrastEffect,
  ColorDepthEffect,
  DepthOfFieldEffect,
  EdgeDetectionMode,
  HueSaturationEffect,
  KernelSize,
  PredicationMode,
  Resolution,
  SMAAPreset,
  SSAOEffect,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
  VignetteTechnique
} from 'postprocessing'
import { SSGIEffect, SSREffect, TRAAEffect } from 'realism-effects'
import { Color, ColorSpace, Texture, TextureEncoding, Vector2 } from 'three'

import { LinearTosRGBEffect } from '../../renderer/effects/LinearTosRGBEffect'

export const Effects = {
  // SMAAEffect: 'SMAAEffect' as const,
  // OutlineEffect: 'OutlineEffect' as const,
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
  // ChromaticAberrationEffect: 'ChromaticAberrationEffect' as const,
  MotionBlurEffect: 'MotionBlurEffect' as const,
  // ColorAverageEffect: 'ColorAverageEffect' as const,
  // DotScreenEffect: 'DotScreenEffect' as const,
  // TiltShiftEffect: 'TiltShiftEffect' as const,
  // GlitchEffect: 'GlitchEffect' as const,
  // GodRaysEffect: 'GodRaysEffect' as const,
  // GridEffect: 'GridEffect' as const,
  // LUT1DEffect: 'LUT1DEffect' as const,
  // LUT3DEffect: 'LUT3DEffect' as const,
  // NoiseEffect: 'NoiseEffect' as const,
  // PixelationEffect: 'PixelationEffect' as const,
  // ScanlineEffect: 'ScanlineEffect' as const,
  // ShockWaveEffect: 'ShockWaveEffect' as const,
  // FXAAEffect: 'FXAAEffect' as const,
  // TextureEffect: 'TextureEffect' as const,
  VignetteEffect: 'VignetteEffect' as const
  // LensDistortionEffect: 'LensDistortionEffect' as const
}

export const EffectMap = {
  // [Effects.SMAAEffect]: SMAAEffect,
  // [Effects.OutlineEffect]: OutlineEffect,
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
  // [Effects.ChromaticAberrationEffect]: ChromaticAberrationEffect,
  // [Effects.MotionBlurEffect]: MotionBlurEffect,
  // [Effects.ColorAverageEffect]: ColorAverageEffect,
  // [Effects.DotScreenEffect]: DotScreenEffect,
  // [Effects.TiltShiftEffect]: TiltShiftEffect,
  // [Effects.GlitchEffect]: GlitchEffect,
  // [Effects.GodRaysEffect]: GodRaysEffect,
  // [Effects.GridEffect]: GridEffect,
  // [Effects.LUT1DEffect]: LUT1DEffect,
  // [Effects.LUT3DEffect]: LUT3DEffect,
  // [Effects.NoiseEffect]: NoiseEffect,
  // [Effects.PixelationEffect]: PixelationEffect, //cant be used with convolution effects(blur)
  // [Effects.ScanlineEffect]: ScanlineEffect,
  // [Effects.ShockWaveEffect]: ShockWaveEffect,
  // [Effects.FXAAEffect]: FXAAEffect,
  // [Effects.TextureEffect]: TextureEffect,
  [Effects.VignetteEffect]: VignetteEffect
  // [Effects.LensDistortionEffect]: LensDistortionEffect
}

export type EffectMapType = (typeof EffectMap)[keyof typeof EffectMap]

export type EffectProps = {
  isActive: boolean
}

export type SMAAEffectProps = EffectProps & {
  preset?: SMAAPreset
  edgeDetectionMode?: EdgeDetectionMode
  predicationMode?: PredicationMode
}

export type OutlineEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  patternTexture?: Texture
  patternScale?: number
  edgeStrength?: number
  pulseSpeed?: number
  visibleEdgeColor?: number
  hiddenEdgeColor?: number
  multisampling?: number
  resolutionScale?: number
  resolutionX?: number
  resolutionY?: number
  width?: number
  height?: number
  kernelSize?: KernelSize
  blur?: boolean
  xRay?: boolean
}

export type SSAOEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  distanceScaling?: boolean
  depthAwareUpsampling?: boolean
  normalDepthBuffer?: Texture
  samples?: number
  rings?: number
  worldDistanceThreshold?: number
  worldDistanceFalloff?: number
  worldProximityThreshold?: number
  worldProximityFalloff?: number
  distanceThreshold?: number
  distanceFalloff?: number
  rangeThreshold?: number
  rangeFalloff?: number
  minRadiusScale?: number
  luminanceInfluence?: number
  radius?: number
  intensity?: number
  bias?: number
  fade?: number
  color?: Color
  resolutionScale?: number
  resolutionX?: number
  resolutionY?: number
  width?: number
  height?: number
  blur?: boolean
  kernelSize?: KernelSize
}

const defaultSSROptions = {
  distance: 10,
  thickness: 10,
  denoiseIterations: 1,
  denoiseKernel: 2,
  denoiseDiffuse: 10,
  denoiseSpecular: 10,
  radius: 3,
  phi: 0.5,
  lumaPhi: 5,
  depthPhi: 2,
  normalPhi: 50,
  roughnessPhi: 50,
  specularPhi: 50,
  envBlur: 0.5,
  importanceSampling: true,
  steps: 20,
  refineSteps: 5,
  resolutionScale: 1,
  missedRays: false
}

export type SSREffectProps = EffectProps & typeof defaultSSROptions

export type DepthOfFieldEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  focusDistance?: number
  focalLength?: number
  focusRange?: number
  bokehScale?: number
  resolutionScale?: number
  resolutionX?: number
  resolutionY?: number
}

export type BloomEffectProps = EffectProps & BloomEffectOptions

export type ToneMappingEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  adaptive?: boolean
  mode?: ToneMappingMode
  resolution?: number
  maxLuminance?: number
  whitePoint?: number
  middleGrey?: number
  minLuminance?: number
  averageLuminance?: number
  adaptationRate?: number
}

export type BrightnessContrastEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  brightness?: number
  contrast?: number
}

export type HueSaturationEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  hue?: number
  saturation?: number
}

export type ColorDepthEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  bits?: number
}

export type LinearTosRGBEffectProps = EffectProps & { blendFunction?: BlendFunction }

export type SSGIEffectProps = EffectProps & {
  distance: number
  thickness: number
  denoiseIterations: number
  denoiseKernel: number
  denoiseDiffuse: number
  denoiseSpecular: number
  radius: number
  phi: number
  lumaPhi: number
  depthPhi: number
  normalPhi: number
  roughnessPhi: number
  specularPhi: number
  envBlur: number
  importanceSampling: boolean
  steps: number
  refineSteps: number
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

export type ChromaticAberrationEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  offset?: Vector2
  radialModulation: boolean
  modulationOffset: number
}
export type ColorAverageEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  bits?: number
}
export type DotScreenEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  angle?: number
  scale?: number
}
export type TiltShiftEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  offset?: number
  rotation?: number
  focusArea?: number
  feather?: number
  bias?: number
  kernelSize?: KernelSize
  resolutionScale?: number
  resolutionX?: number
  resolutionY?: number
}
export type GlitchEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  chromaticAberrationOffset?: Vector2
  delay?: Vector2
  duration?: Vector2
  strength?: Vector2
  perturbationMap?: Texture
  dtSize?: number
  columns?: number
  ratio?: number
}
export type GodRaysEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  samples?: number
  density?: number
  decay?: number
  weight?: number
  exposure?: number
  clampMax?: number
  resolutionScale?: number
  resolutionX?: number
  resolutionY?: number
  width?: number
  height?: number
  kernelSize?: KernelSize
  blur?: boolean
}
export type GridEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  scale?: number
  lineWidth?: number
}
export type LUT1DEffectProps = EffectProps & { blendFunction?: BlendFunction }
export type LUT3DEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  tetrahedralInterpolation?: boolean
  inputEncoding?: TextureEncoding
  inputColorSpace?: ColorSpace
}
export type NoiseEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  premultiply?: boolean
}
export type PixelationEffectProps = EffectProps & { granularity?: number }
export type ScanlineEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  density?: number
}
export type ShockWaveEffectProps = EffectProps & {
  speed?: number
  maxRadius?: number
  waveSize?: number
  amplitude?: number
}
export type FXAAEffectProps = EffectProps & { blendFunction?: BlendFunction }
export type TextureEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  texture?: Texture
  aspectCorrection?: boolean
}
export type VignetteEffectProps = EffectProps & {
  blendFunction?: BlendFunction
  technique?: VignetteTechnique
  eskil?: boolean
  offset?: number
  darkness?: number
}
export type LensDistortionEffectProps = EffectProps & {
  distortion: Vector2
  principalPoint: Vector2
  focalLength: Vector2
  skew?: number
}

export type EffectPropsSchema = {
  // [Effects.SMAAEffect]: SMAAEffectProps
  // [Effects.OutlineEffect]: OutlineEffectProps
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
  // [Effects.ChromaticAberrationEffect]: ChromaticAberrationEffectProps
  // [Effects.ColorAverageEffect]: ColorAverageEffectProps
  // [Effects.DotScreenEffect]: DotScreenEffectProps
  // [Effects.TiltShiftEffect]: TiltShiftEffectProps
  // [Effects.GlitchEffect]: GlitchEffectProps
  // [Effects.GodRaysEffect]: GodRaysEffectProps
  // [Effects.GridEffect]: GridEffectProps
  // [Effects.LUT1DEffect]: LUT1DEffectProps
  // [Effects.LUT3DEffect]: LUT3DEffectProps
  // [Effects.NoiseEffect]: NoiseEffectProps
  // [Effects.PixelationEffect]: PixelationEffectProps
  // [Effects.ScanlineEffect]: ScanlineEffectProps
  // [Effects.ShockWaveEffect]: ShockWaveEffectProps
  // [Effects.FXAAEffect]: FXAAEffectProps
  // [Effects.TextureEffect]: TextureEffectProps
  [Effects.VignetteEffect]: VignetteEffectProps
  // [Effects.LensDistortionEffect]: LensDistortionEffectProps
}

export type EffectPropsSchemaType = (typeof defaultPostProcessingSchema)[keyof typeof defaultPostProcessingSchema]

export const defaultPostProcessingSchema: EffectPropsSchema = {
  // [Effects.SMAAEffect]: {
  //   isActive: false,
  //   preset: SMAAPreset.MEDIUM,
  //   edgeDetectionMode: EdgeDetectionMode.COLOR,
  //   predicationMode: PredicationMode.DISABLED
  // },
  // [Effects.OutlineEffect]: {
  //   isActive: false,
  //   blendFunction: BlendFunction.SCREEN,
  //   patternScale: 1.0,
  //   edgeStrength: 1.0,
  //   pulseSpeed: 0.0,
  //   visibleEdgeColor: 0xffffff,
  //   hiddenEdgeColor: 0x22090a,
  //   multisampling: 0,
  //   resolutionScale: 0.5,
  //   resolutionX: Resolution.AUTO_SIZE,
  //   resolutionY: Resolution.AUTO_SIZE,
  //   width: Resolution.AUTO_SIZE,
  //   height: 480,
  //   kernelSize: KernelSize.VERY_SMALL,
  //   blur: false,
  //   xRay: true
  // },
  [Effects.SSREffect]: {
    isActive: false,
    ...defaultSSROptions
  },
  [Effects.SSGIEffect]: {
    isActive: false,
    distance: 10,
    thickness: 10,
    denoiseIterations: 1,
    denoiseKernel: 2,
    denoiseDiffuse: 10,
    denoiseSpecular: 10,
    radius: 3,
    phi: 0.5,
    lumaPhi: 5,
    depthPhi: 2,
    normalPhi: 50,
    roughnessPhi: 50,
    specularPhi: 50,
    envBlur: 0.5,
    importanceSampling: true,
    steps: 20,
    refineSteps: 5,
    resolutionScale: 1,
    missedRays: false
  },
  [Effects.SSAOEffect]: {
    isActive: false,
    blendFunction: BlendFunction.MULTIPLY,
    distanceScaling: true,
    depthAwareUpsampling: true,
    normalDepthBuffer: undefined,
    samples: 9,
    rings: 7,
    // worldDistanceThreshold: 0.97,
    // worldDistanceFalloff: 0.03,
    // worldProximityThreshold: 0.0005,
    // worldProximityFalloff: 0.001,
    distanceThreshold: 0.125, // Render up to a distance of ~20 world units
    distanceFalloff: 0.02, // with an additional ~2.5 units of falloff.
    rangeThreshold: 0.0005,
    rangeFalloff: 0.001,
    minRadiusScale: 0.1,
    luminanceInfluence: 0.7,
    bias: 0.025,
    radius: 0.1825,
    intensity: 1.0,
    fade: 0.01,
    color: undefined,
    resolutionScale: 1.0,
    resolutionX: Resolution.AUTO_SIZE,
    resolutionY: Resolution.AUTO_SIZE,
    width: Resolution.AUTO_SIZE,
    height: Resolution.AUTO_SIZE,
    kernelSize: KernelSize.SMALL,
    blur: true
  },
  [Effects.DepthOfFieldEffect]: {
    isActive: false,
    blendFunction: BlendFunction.NORMAL,
    focusDistance: 0.1,
    focalLength: 0.1,
    focusRange: 0.1,
    bokehScale: 1.0,
    resolutionScale: 1.0,
    resolutionX: Resolution.AUTO_SIZE,
    resolutionY: Resolution.AUTO_SIZE
  },
  [Effects.BloomEffect]: {
    isActive: true,
    blendFunction: BlendFunction.SCREEN,
    kernelSize: KernelSize.LARGE,
    luminanceThreshold: 0.9,
    luminanceSmoothing: 0.025,
    mipmapBlur: false,
    intensity: 1.0,
    radius: 0.85,
    levels: 8
  },
  [Effects.ToneMappingEffect]: {
    isActive: false,
    blendFunction: BlendFunction.NORMAL,
    adaptive: false,
    mode: ToneMappingMode.ACES_FILMIC,
    resolution: 256,
    maxLuminance: 4.0,
    whitePoint: 4.0,
    middleGrey: 0.6,
    minLuminance: 0.01,
    averageLuminance: 1.0,
    adaptationRate: 1.0
  },
  [Effects.BrightnessContrastEffect]: {
    isActive: false,
    blendFunction: BlendFunction.NORMAL,
    brightness: 0.0,
    contrast: 0.0
  },
  [Effects.HueSaturationEffect]: {
    isActive: false,
    blendFunction: BlendFunction.NORMAL,
    hue: 0,
    saturation: 0.0
  },
  [Effects.ColorDepthEffect]: {
    isActive: false,
    blendFunction: BlendFunction.NORMAL,
    bits: 16
  },
  [Effects.LinearTosRGBEffect]: {
    isActive: false
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
  },
  // [Effects.ChromaticAberrationEffect]: {
  //   isActive: false,
  //   blendFunction: BlendFunction.NORMAL,
  //   offset: undefined,
  //   radialModulation: false,
  //   modulationOffset: 0.15
  // },
  // [Effects.ColorAverageEffect]: {
  //   isActive: false,
  //   blendFunction: BlendFunction.NORMAL
  // },
  // [Effects.DotScreenEffect]: { isActive: false, blendFunction: BlendFunction.NORMAL, angle: 1.57, scale: 1.0 },
  // [Effects.TiltShiftEffect]: {
  //   isActive: false,
  //   blendFunction: BlendFunction.NORMAL,
  //   offset: 0.0,
  //   rotation: 0.0,
  //   focusArea: 0.4,
  //   feather: 0.3,
  //   bias: 0.06,
  //   kernelSize: KernelSize.MEDIUM,
  //   resolutionScale: 0.5,
  //   resolutionX: Resolution.AUTO_SIZE,
  //   resolutionY: Resolution.AUTO_SIZE
  // },
  // [Effects.GlitchEffect]: {
  //   isActive: false,
  //   blendFunction: BlendFunction.NORMAL,
  //   chromaticAberrationOffset: undefined,
  //   delay: undefined,
  //   duration: undefined,
  //   strength: undefined,
  //   perturbationMap: undefined,
  //   dtSize: 64,
  //   columns: 0.05,
  //   ratio: 0.85
  // },
  // [Effects.GodRaysEffect]: {
  //   isActive: false,
  //   blendFunction: BlendFunction.SCREEN,
  //   samples: 60.0,
  //   density: 0.96,
  //   decay: 0.9,
  //   weight: 0.4,
  //   exposure: 0.6,
  //   clampMax: 1.0,
  //   resolutionScale: 0.5,
  //   resolutionX: Resolution.AUTO_SIZE,
  //   resolutionY: Resolution.AUTO_SIZE,
  //   width: Resolution.AUTO_SIZE,
  //   height: Resolution.AUTO_SIZE,
  //   kernelSize: KernelSize.SMALL,
  //   blur: true
  // },
  // [Effects.GridEffect]: {
  //   isActive: false,
  //   blendFunction: BlendFunction.OVERLAY,
  //   scale: 1.0,
  //   lineWidth: 0.0
  // },
  // [Effects.LUT1DEffect]: { isActive: false, blendFunction: BlendFunction.SET },
  // [Effects.LUT3DEffect]: { isActive: false, blendFunction: BlendFunction.SET, tetrahedralInterpolation: false, inputEncoding: sRGBEncoding, inputColorSpace: SRGBColorSpace },
  // [Effects.NoiseEffect]: { isActive: false, blendFunction: BlendFunction.SCREEN, premultiply: false },
  // [Effects.PixelationEffect]: { isActive: false, granularity: 30 },
  // [Effects.ScanlineEffect]: { isActive: false, blendFunction: BlendFunction.OVERLAY, density: 1.25},
  // [Effects.ShockWaveEffect]: {
  //   isActive: false,
  //   speed: 2.0,
  //   maxRadius: 1.0,
  //   waveSize: 0.2,
  //   amplitude: 0.05,
  // },
  // [Effects.FXAAEffect]: { isActive: false, blendFunction: BlendFunction.SRC },
  // [Effects.TextureEffect]: {
  //   isActive: false,
  //   blendFunction: BlendFunction.NORMAL,
  //   texture: undefined,
  //   aspectCorrection: false
  // },
  [Effects.VignetteEffect]: {
    isActive: false,
    blendFunction: BlendFunction.NORMAL,
    technique: VignetteTechnique.DEFAULT,
    eskil: false,
    offset: 0.5,
    darkness: 0.5
  }
  // [Effects.LensDistortionEffect]: {
  //   isActive: false,
  //   distortion: new Vector2(0,0),
  //   principalPoint: new Vector2(0,0),
  //   focalLength: new Vector2(0,0),
  //   skew: 0
  // }
}

/**
 * Based on Unity's post processing pipelines
 * - https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@17.0/manual/rendering-excecution-order.html
 * - https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@17.0/manual/EffectList.html
 * - https://docs.unity3d.com/Packages/com.unity.render-pipelines.core@17.0/manual
 */

/** 1. input aliasing */
// Effects.SMAAEffect,
// Effects.OutlineEffect,

export const effectInOrder = [
  /** 2. world effects */
  // Effects.PaniniProjection,
  Effects.DepthOfFieldEffect,
  Effects.SSAOEffect, // TODO- add option to use HBAO
  Effects.SSREffect,
  Effects.SSGIEffect,
  // Effects.GodRaysEffect,

  /** 3. camera effects */
  // Effects.LensDistortionEffect,
  //Effects.LensFlareEffect,
  // Effects.ChromaticAberrationEffect,
  Effects.MotionBlurEffect,
  Effects.BloomEffect,
  Effects.VignetteEffect,

  /** 4. color grading */
  Effects.ToneMappingEffect,
  // maybe replace with Shadows/Midtones/Highlights ?
  Effects.BrightnessContrastEffect,
  Effects.HueSaturationEffect,
  Effects.ColorDepthEffect,
  // Effects.LUT1DEffect,
  // Effects.LUT3DEffect,

  /** 5. final fix, aliasing and noise passes */
  Effects.LinearTosRGBEffect, // should this just be always on?
  Effects.TRAAEffect
  // Effects.FXAAEffect
]
