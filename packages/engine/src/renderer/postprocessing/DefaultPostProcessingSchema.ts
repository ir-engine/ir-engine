import { PostProcessingSchema } from './PostProcessingSchema';
import { SSAOEffect } from './SSAOEffect';
import { BloomEffect } from './BloomEffect';
import { BlendFunction } from './blending/BlendFunction';
import { KernelSize } from './materials/ConvolutionMaterial';
import { ToneMappingEffect } from './ToneMappingEffect';
import { HueSaturationEffect } from './HueSaturationEffect';
import { DepthOfFieldEffect } from './DepthOfFieldEffect';
import { BrightnessContrastEffect } from './BrightnessContrastEffect';
import { Resizer } from './core/Resizer';
import { OutlineEffect } from './OutlineEffect';
import { LinearTosRGBEffect } from "./LinearTosRGBEffect";
import { FXAAEffect } from "./FXAAEffect";

export const DefaultPostProcessingSchema: PostProcessingSchema = {
  effects: [
    {
      effect: FXAAEffect,
      options: {
        blendFunction: BlendFunction.NORMAL
      }
    },
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
  //  {
  //     effect: SSAOEffect,
  //     options: {
  //       blendFunction: BlendFunction.MULTIPLY,
	// 		distanceScaling: true,
	// 		depthAwareUpsampling: true,
	// 		samples: 16,
	// 		rings: 7,
	// 		distanceThreshold: .125,	// Render up to a distance of ~20 world units
	// 		distanceFalloff: 0.02,	// with an additional ~2.5 units of falloff.
  //     minRadiusScale: 1,
  //     bias: .25,
	// 		radius: .01,
  //     intensity: 2,
  //     fade: 0.05
  //     }
  //   },
    // {
    //   effect: DepthOfFieldEffect,
    //   options: {
    //     blendFunction: BlendFunction.NORMAL,
    //     focusDistance: 0.02,
    //     focalLength: 0.5,
    //     bokehScale: 1
    //   }
    // },
    // Bloom
    {
      effect: BloomEffect,
      options: {
        blendFunction: BlendFunction.SCREEN,
        kernelSize: KernelSize.SMALL,
        luminanceThreshold: 1.05,
        luminanceSmoothing: 0.1,
        intensity: 1
      }
    },
    // // Tonemapping
    // {
    //   effect: ToneMappingEffect,
    //   options: {
    //     blendFunction: BlendFunction.NORMAL,
    //     adaptive: true,
    //     resolution: 512,
    //     middleGrey: 0.6,
    //     maxLuminance: 32.0,
    //     averageLuminance: 1.0,
    //     adaptationRate: 2.0
    //   }
    // },
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
    {
      effect: LinearTosRGBEffect
    }
  ]
};
