import { PostProcessingSchema } from '../../postprocessing/interfaces/PostProcessingSchema';
import { SSAOEffect } from '../../postprocessing/effects/SSAOEffect';
import { BloomEffect } from '../../postprocessing/effects/BloomEffect';
import { BlendFunction } from '../../postprocessing/effects/blending/BlendFunction';
import { KernelSize } from '../../postprocessing/materials/ConvolutionMaterial';
import { ToneMappingEffect } from '../../postprocessing/effects/ToneMappingEffect';
import { HueSaturationEffect } from '../../postprocessing/effects/HueSaturationEffect';
import { DepthOfFieldEffect } from '../../postprocessing/effects/DepthOfFieldEffect';
import { BrightnessContrastEffect } from '../../postprocessing/effects/BrightnessContrastEffect';
import { Resizer } from '../../postprocessing/core/Resizer';
import { OutlineEffect } from '../../postprocessing/effects/OutlineEffect';

export const DefaultPostProcessingSchema: PostProcessingSchema = {
  effects: [

    {
      effect: OutlineEffect,
      options: {
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
      }
    },
/*
    {
      effect: DepthOfFieldEffect,
      options: {
        blendFunction: BlendFunction.NORMAL,
        focusDistance: 0.02,
        focalLength: 0.5,
        bokehScale: 1
      }
    },
    */
    // Bloom
    /*
    {
      effect: BloomEffect,
      options: {
        blendFunction: BlendFunction.SCREEN,
        kernelSize: KernelSize.MEDIUM,
        luminanceThreshold: 1.05,
        luminanceSmoothing: 0.1,
        intensity: 1
      }
    },
    */
    // Tonemapping
    {
      effect: ToneMappingEffect,
      options: {
        blendFunction: BlendFunction.NORMAL,
        adaptive: true,
        resolution: 512,
        middleGrey: 0.6,
        maxLuminance: 32.0,
        averageLuminance: 1.0,
        adaptationRate: 2.0
      }
    },
    // DOF
        // // Color Grading
        /*
        {
          effect: BrightnessContrastEffect,
          options: {
            brightness: 0.05,
            contrast: 0.1
          }
        },
        // // Color Grading
        {
          effect: HueSaturationEffect,
          options: {
            hue: 0,
            saturation: -.15
          }
        },
        */
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
    // Color Depth
    // {
    //   effect: ColorDepthEffect,
    //   options: {
    //     bits: 16
    //   }
    // }
  ]
};
