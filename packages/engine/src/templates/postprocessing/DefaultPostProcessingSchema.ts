import { PostProcessingSchema } from '../../postprocessing/interfaces/PostProcessingSchema';
import { SSAOEffect } from '../../postprocessing/effects/SSAOEffect';
import { BloomEffect } from '../../postprocessing/effects/BloomEffect';
import { BlendFunction } from '../../postprocessing/effects/blending/BlendFunction';
import { KernelSize } from '../../postprocessing/materials/ConvolutionMaterial';
import { ToneMappingEffect } from '../../postprocessing/effects/ToneMappingEffect';
import { HueSaturationEffect } from '../../postprocessing/effects/HueSaturationEffect';
import { DepthOfFieldEffect } from '../../postprocessing/effects/DepthOfFieldEffect';
import { BrightnessContrastEffect } from '../../postprocessing/effects/BrightnessContrastEffect';

export const DefaultPostProcessingSchema: PostProcessingSchema = {
  effects: [

    {
      effect: SSAOEffect,
      options: {
        blendFunction: BlendFunction.MULTIPLY,
			distanceScaling: true,
			depthAwareUpsampling: true,
			samples: 8,
			rings: 7,
			distanceThreshold: .125,	// Render up to a distance of ~20 world units
			distanceFalloff: 0.02,	// with an additional ~2.5 units of falloff.
      minRadiusScale: 0.001,
      bias: .2,
			radius: .04,
      intensity: 5,
      fade: 0.05
      }
    },
    {
      effect: DepthOfFieldEffect,
      options: {
        blendFunction: BlendFunction.NORMAL,
        focusDistance: 0.02,
        focalLength: 0.5,
        bokehScale: 1
      }
    },
    // Bloom
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
