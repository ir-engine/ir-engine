// import * as PostProcessing from '../classes/postprocessing';
import { PostProcessingSchema } from '../interfaces/PostProcessingSchema';

export const DefaultPostProcessingSchema: PostProcessingSchema = {
  effects: [
    // {
    //   effect: PostProcessing.SSAOEffect,
    //   options: {
    //     resolution: 0.5,
    //     samples: 8,
    //     rings: 5,
    //     radius: 0.1,
    //     intensity: 2
    //   }
    // },
    // // Bloom
    // {
    //   effect: PostProcessing.BloomEffect,
    //   options: {
    //     blendFunction: PostProcessing.BlendFunction.SCREEN,
    //     kernelSize: PostProcessing.KernelSize.MEDIUM,
    //     luminanceThreshold: 0.8,
    //     luminanceSmoothing: 0.075,
    //     height: 480
    //   }
    // },
    // // Tonemapping
    // {
    //   effect: PostProcessing.ToneMappingEffect,
    //   options: {
    //     blendFunction: PostProcessing.BlendFunction.NORMAL,
    //     adaptive: true,
    //     resolution: 256,
    //     middleGrey: 0.6,
    //     maxLuminance: 16.0,
    //     averageLuminance: 1.0,
    //     adaptationRate: 2.0
    //   }
    // },
    // // Color Grading
    // {
    //   effect: PostProcessing.BrightnessContrastEffect,
    //   options: {
    //     brightness: 0.1,
    //     contrast: 0.1
    //   }
    // },
    // // Color Grading
    // {
    //   effect: PostProcessing.HueSaturationEffect,
    //   options: {
    //     hue: 0.0,
    //     saturation: 0.1
    //   }
    // },
    // // DOF
    // {
    //   effect: PostProcessing.DepthOfFieldEffect,
    //   options: {
    //     blendFunction: PostProcessing.BlendFunction.NORMAL,
    //     focusDistance: 0.0,
    //     focalLength: 0.2,
    //     bokehScale: 1.0
    //   }
    // }
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
};
