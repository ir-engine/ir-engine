import {
  BlendFunction,
  KernelSize,
  SSAOEffect,
  BloomEffect,
  ToneMappingEffect,
  BrightnessContrastEffect,
  HueSaturationEffect,
  DepthOfFieldEffect,
  GodRaysEffect,
  ColorDepthEffect
} from "postprocessing"
import { PostProcessingSchema } from "../interfaces/PostProcessingSchema"
export const DefaultPostProcessingSchema: PostProcessingSchema = {
  effects: [
    {
      effect: SSAOEffect,
      options: {
        resolution: 0.5,
        samples: 8,
        rings: 5,
        radius: 0.1,
        intensity: 2
      }
    },
    // Bloom
    {
      effect: BloomEffect,
      options: {
        blendFunction: BlendFunction.SCREEN,
        kernelSize: KernelSize.MEDIUM,
        luminanceThreshold: 0.8,
        luminanceSmoothing: 0.075,
        height: 480
      }
    },
    // Tonemapping
    {
      effect: ToneMappingEffect,
      options: {
        blendFunction: BlendFunction.NORMAL,
        adaptive: true,
        resolution: 256,
        middleGrey: 0.6,
        maxLuminance: 16.0,
        averageLuminance: 1.0,
        adaptationRate: 2.0
      }
    },
    // Color Grading
    {
      effect: BrightnessContrastEffect,
      options: {
        brightness: 0.1,
        contrast: 0.1
      }
    },
    // Color Grading
    {
      effect: HueSaturationEffect,
      options: {
        hue: 0.0,
        saturation: 0.1
      }
    },
    // DOF
    {
      effect: DepthOfFieldEffect,
      options: {
        blendFunction: BlendFunction.NORMAL,
        focusDistance: 0.0,
        focalLength: 0.2,
        bokehScale: 1.0
      }
    }
    // // GodRays
    // {
    //   effect: GodRaysEffect,
    //   options: {
    //     blendFunction: BlendFunction.SCREEN,
    //     kernelSize: KernelSize.MEDIUM,
    //     luminanceThreshold: 0.8,
    //     luminanceSmoothing: 0.075,
    //     height: 480
    //   }
    // },
    // // Color Depth
    // {
    //   effect: ColorDepthEffect,
    //   options: {
    //     bits: 16
    //   }
    // }
  ]
}
