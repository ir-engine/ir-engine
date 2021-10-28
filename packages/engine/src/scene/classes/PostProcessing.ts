import { ColorRepresentation, Object3D, Texture } from 'three'
import {
  BlendFunction,
  BloomEffect,
  BrightnessContrastEffect,
  ColorDepthEffect,
  Resizer,
  DepthOfFieldEffect,
  HueSaturationEffect,
  KernelSize,
  OutlineEffect,
  SSAOEffect,
  ToneMappingEffect
} from 'postprocessing'
import { LinearTosRGBEffect } from '../../renderer/effects/LinearTosRGBEffect'
import { FXAAEffect } from '../../renderer/effects/FXAAEffect'

export enum Effects {
  FXAAEffect = 'FXAAEffect',
  OutlineEffect = 'OutlineEffect',
  SSAOEffect = 'SSAOEffect',
  DepthOfFieldEffect = 'DepthOfFieldEffect',
  BloomEffect = 'BloomEffect',
  ToneMappingEffect = 'ToneMappingEffect',
  BrightnessContrastEffect = 'BrightnessContrastEffect',
  HueSaturationEffect = 'HueSaturationEffect',
  ColorDepthEffect = 'ColorDepthEffect',
  LinearTosRGBEffect = 'LinearTosRGBEffect',
}

export type EffectType = {
  EffectClass: any
}

export const EffectMap = new Map<Effects, EffectType>()
EffectMap.set(Effects.FXAAEffect, { EffectClass: FXAAEffect })
EffectMap.set(Effects.OutlineEffect, { EffectClass: OutlineEffect })
EffectMap.set(Effects.SSAOEffect, { EffectClass: SSAOEffect })
EffectMap.set(Effects.DepthOfFieldEffect, { EffectClass: DepthOfFieldEffect })
EffectMap.set(Effects.BloomEffect, { EffectClass: BloomEffect })
EffectMap.set(Effects.ToneMappingEffect, { EffectClass: ToneMappingEffect })
EffectMap.set(Effects.BrightnessContrastEffect, { EffectClass: BrightnessContrastEffect })
EffectMap.set(Effects.HueSaturationEffect, { EffectClass: HueSaturationEffect })
EffectMap.set(Effects.ColorDepthEffect, { EffectClass: ColorDepthEffect })
EffectMap.set(Effects.LinearTosRGBEffect, { EffectClass: LinearTosRGBEffect })

export type EffectProps = {
  active: boolean
  blendFunction?: BlendFunction
}

export type FXAAEffectProps = EffectProps

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

export type EffectPropsSchema = {
  [Effects.FXAAEffect]: FXAAEffectProps
  [Effects.OutlineEffect]: OutlineEffectProps
  [Effects.SSAOEffect]: SSAOEffectProps
  [Effects.DepthOfFieldEffect]: DepthOfFieldEffectProps
  [Effects.BloomEffect]: BloomEffectProps
  [Effects.ToneMappingEffect]: ToneMappingEffectProps
  [Effects.BrightnessContrastEffect]: BrightnessContrastEffectProps
  [Effects.HueSaturationEffect]: HueSaturationEffectProps
  [Effects.ColorDepthEffect]: ColorDepthEffectProps
  [Effects.LinearTosRGBEffect]: LinearTosRGBEffectProps
}


export const defaultPostProcessingSchema: EffectPropsSchema = {
  [Effects.FXAAEffect]: {
    active: true,
    blendFunction: BlendFunction.NORMAL
  },
  [Effects.OutlineEffect]: {
    active: true,
    blendFunction: BlendFunction.SCREEN,
    patternTexture: null,
    edgeStrength: 1.0,
    pulseSpeed: 0.0,
    visibleEdgeColor: 0xffffff,
    hiddenEdgeColor: 0x22090a,
    resolutionScale: 0.5,
    width: Resizer.AUTO_SIZE,
    height: Resizer.AUTO_SIZE,
    kernelSize: KernelSize.VERY_SMALL,
    blur: false,
    xRay: true
  },
  [Effects.SSAOEffect]: {
    active: false,
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
  [Effects.DepthOfFieldEffect]: {
    active: false,
    blendFunction: BlendFunction.NORMAL,
    focusDistance: 0.02,
    focalLength: 0.5,
    bokehScale: 1
  },
  [Effects.BloomEffect]: {
    active: true,
    blendFunction: BlendFunction.SCREEN,
    kernelSize: KernelSize.MEDIUM,
    luminanceThreshold: 1.0,
    luminanceSmoothing: 0.1,
    intensity: 0.2
  },
  [Effects.ToneMappingEffect]: {
    active: false,
    blendFunction: BlendFunction.NORMAL,
    adaptive: true,
    resolution: 512,
    middleGrey: 0.6,
    maxLuminance: 32.0,
    averageLuminance: 1.0,
    adaptationRate: 2.0
  },
  [Effects.BrightnessContrastEffect]: {
    active: false,
    brightness: 0.05,
    contrast: 0.1
  },
  [Effects.HueSaturationEffect]: {
    active: false,
    hue: 0,
    saturation: -0.15
  },
  [Effects.ColorDepthEffect]: {
    active: false,
    bits: 16
  },
  [Effects.LinearTosRGBEffect]: {
    active: false
  }
}

export default class PostProcessing extends Object3D {
  postProcessingOptions: any = {}
  visible = true
  static get defaultOptions() {
    return defaultPostProcessingSchema
  }

  getPropertyValue = (schemaArra: []): any => {
    if (schemaArra.length < 1) return null
    let value = this.postProcessingOptions
    schemaArra.forEach((element) => {
      if (value[element] === '') return null
      value = value[element]
    })
    return value
  }
}
