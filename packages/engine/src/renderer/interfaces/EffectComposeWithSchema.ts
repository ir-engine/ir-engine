import {
  BloomEffect,
  BrightnessContrastEffect,
  ColorDepthEffect,
  DepthOfFieldEffect,
  EffectComposer,
  HueSaturationEffect,
  OutlineEffect,
  SSAOEffect,
  ToneMappingEffect
} from 'postprocessing'
import { WebGLRenderer, WebGLRenderTarget } from 'three';
import { FXAAEffect } from '../effects/FXAAEffect';
import { LinearTosRGBEffect } from '../effects/LinearTosRGBEffect';

export interface EffectComposerWithSchema extends EffectComposer {
  // TODO: 'postprocessing' needs typing, we could create a '@types/postprocessing' package?
  renderer: WebGLRenderer
  inputBuffer: WebGLRenderTarget
  outputBuffer: WebGLRenderTarget
  copyPass: any
  depthTexture: any
  passes: any[]
  autoRenderToScreen: boolean
  multisampling: number
  getRenderer()
  replaceRenderer(renderer, updateDOM)
  createDepthTexture()
  deleteDepthTexture()
  createBuffer(depthBuffer, stencilBuffer, type, multisampling)
  addPass(renderPass: any)
  removePass()
  removeAllPasses()
  render(delta: number)
  setSize(width: number, height: number, arg2: boolean)
  reset()
  dispose()

  // this is what this is for, i just added the EffectComposer typings above
  OutlineEffect: OutlineEffect
  FXAAEffect: FXAAEffect
  SSAOEffect: SSAOEffect
  DepthOfFieldEffect: DepthOfFieldEffect
  BloomEffect: BloomEffect
  ToneMappingEffect: ToneMappingEffect
  BrightnessContrastEffect: BrightnessContrastEffect
  HueSaturationEffect: HueSaturationEffect
  ColorDepthEffect: ColorDepthEffect
  LinearTosRGBEffect: LinearTosRGBEffect
}
