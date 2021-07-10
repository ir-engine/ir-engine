import { Object3D } from 'three'
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

/**
 * @author Shaw & Abhishek Pathak <abhi.pathak401@gmail.com>
 */

export const effectType = {
  FXAAEffect: {
    effect: FXAAEffect
  },
  OutlineEffect: {
    effect: OutlineEffect
  },
  SSAOEffect: {
    effect: SSAOEffect
  },
  DepthOfFieldEffect: {
    effect: DepthOfFieldEffect
  },
  BloomEffect: {
    effect: BloomEffect
  },
  ToneMappingEffect: {
    effect: ToneMappingEffect
  },
  BrightnessContrastEffect: {
    effect: BrightnessContrastEffect
  },
  HueSaturationEffect: {
    effect: HueSaturationEffect
  },

  ColorDepthEffect: {
    effect: ColorDepthEffect
  },
  LinearTosRGBEffect: {
    effect: LinearTosRGBEffect
  }
}

export const defaultPostProcessingSchema = {
  FXAAEffect: {
    isActive: true,
    blendFunction: BlendFunction.NORMAL
  },
  OutlineEffect: {
    isActive: true,
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
  SSAOEffect: {
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
  DepthOfFieldEffect: {
    isActive: false,
    blendFunction: BlendFunction.NORMAL,
    focusDistance: 0.02,
    focalLength: 0.5,
    bokehScale: 1
  },
  BloomEffect: {
    isActive: true,
    blendFunction: BlendFunction.SCREEN,
    kernelSize: KernelSize.MEDIUM,
    luminanceThreshold: 1.0,
    luminanceSmoothing: 0.1,
    intensity: 0.2
  },
  ToneMappingEffect: {
    isActive: false,
    blendFunction: BlendFunction.NORMAL,
    adaptive: true,
    resolution: 512,
    middleGrey: 0.6,
    maxLuminance: 32.0,
    averageLuminance: 1.0,
    adaptationRate: 2.0
  },
  BrightnessContrastEffect: {
    isActive: false,
    brightness: 0.05,
    contrast: 0.1
  },
  HueSaturationEffect: {
    isActive: false,
    hue: 0,
    saturation: -0.15
  },
  ColorDepthEffect: {
    isActive: false,
    bits: 16
  },
  LinearTosRGBEffect: {
    isActive: false
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
