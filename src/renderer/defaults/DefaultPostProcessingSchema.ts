import { SSAOEffect, BloomEffect, BlendFunction, KernelSize } from "postprocessing"
import { PostProcessingSchema } from "../interfaces/PostProcessingSchema"
export const DefaultPostProcessingSchema: PostProcessingSchema = {
  passes: [
    // MSAA
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
    }
  ]
}
