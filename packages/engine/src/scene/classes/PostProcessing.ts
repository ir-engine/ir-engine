import { Object3D } from "three";
import { BlendFunction } from "../../renderer/postprocessing/blending/BlendFunction";
import { BloomEffect } from "../../renderer/postprocessing/BloomEffect";
import { BrightnessContrastEffect } from "../../renderer/postprocessing/BrightnessContrastEffect";
import { ColorDepthEffect } from "../../renderer/postprocessing/ColorDepthEffect";
import { Resizer } from "../../renderer/postprocessing/core/Resizer";
import { DepthOfFieldEffect } from "../../renderer/postprocessing/DepthOfFieldEffect";
import { FXAAEffect } from "../../renderer/postprocessing/FXAAEffect";
import { HueSaturationEffect } from "../../renderer/postprocessing/HueSaturationEffect";
import { LinearTosRGBEffect } from "../../renderer/postprocessing/LinearTosRGBEffect";
import { KernelSize } from "../../renderer/postprocessing/materials/ConvolutionMaterial";
import { OutlineEffect } from "../../renderer/postprocessing/OutlineEffect";
import { SSAOEffect } from "../../renderer/postprocessing/SSAOEffect";
import { ToneMappingEffect } from "../../renderer/postprocessing/ToneMappingEffect";

/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */



export const effectType = {
  FXAAEffect: {
    effect: FXAAEffect,
  },
  OutlineEffect: {
    effect: OutlineEffect,
  },
  SSAOEffect: {
    effect: SSAOEffect,
  },
  DepthOfFieldEffect: {
    effect: DepthOfFieldEffect,
  },
  BloomEffect: {
    effect: BloomEffect,
  },
  ToneMappingEffect: {
    effect: ToneMappingEffect,
  },
  BrightnessContrastEffect: {
    effect: BrightnessContrastEffect,
  },
  HueSaturationEffect: {
    effect: HueSaturationEffect,
  },

  ColorDepthEffect: {
    effect: ColorDepthEffect,
  },
  LinearTosRGBEffect: {
    effect: LinearTosRGBEffect,
  }
}

export const defaultPostProcessingSchema = {
  FXAAEffect: {
    isActive: true,
    blendFunction: BlendFunction.NORMAL,
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
    distanceThreshold: .125,	// Render up to a distance of ~20 world units
    distanceFalloff: 0.02,	// with an additional ~2.5 units of falloff.
    minRadiusScale: 1,
    bias: .25,
    radius: .01,
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
    kernelSize: 0,
    luminanceThreshold: 1.05,
    luminanceSmoothing: 0.1,
    intensity: 1
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
    saturation: -.15
  },
  ColorDepthEffect: {
    isActive: false,
    bits: 16
  },
  LinearTosRGBEffect: {
    isActive: false,
  }
};

export default class PostProcessing extends Object3D {
  postProcessingOptions: any = {};
  visible = true
  static get defaultOptions() {
    return (defaultPostProcessingSchema);
  }

  getPropertyValue = (schemaArra: []): any => {
    if (schemaArra.length < 1) return null;
    let value = this.postProcessingOptions;
    schemaArra.forEach(element => {
      if (value[element] === "")
        return null;
      value = value[element];
    });
    return value;
  }
}