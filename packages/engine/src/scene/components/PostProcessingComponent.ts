import { NormalPass, DepthDownsamplingPass } from 'postprocessing'
import { NearestFilter, RGBFormat, WebGLRenderTarget } from 'three'
import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { Engine } from '../../ecs/classes/Engine'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import PostProcessing, { EffectPropsSchema, Effects } from '../classes/PostProcessing'
import { BloomEffectWrapper } from '../classes/postprocessing/BloomEffectWrapper'
import { BrightnessContrastEffectWrapper } from '../classes/postprocessing/BrightnessContrastEffectWrapper'
import { ColorDepthEffectWrapper } from '../classes/postprocessing/ColorDepthEffectWrapper'
import { DepthOfFieldEffectWrapper } from '../classes/postprocessing/DepthOfFieldEffectWrapper'
import { FXAAEffectWrapper } from '../classes/postprocessing/FXAAEffectWrapper'
import { HueSaturationEffectWrapper } from '../classes/postprocessing/HueSaturationEffectWrapper'
import { LinearTosRGBEffectWrapper } from '../classes/postprocessing/LinearTosRGBEffectWrapper'
import { OutlineEffectWrapper } from '../classes/postprocessing/OutlineEffectWrapper'
import { SSAOEffectWrapper } from '../classes/postprocessing/SSAOEffectWrapper'
import { ToneMappingEffectWrapper } from '../classes/postprocessing/ToneMappingEffectWrapper'

export type PostProcessingDataProps = EffectPropsSchema

export class PostProcessingData implements ComponentData {
  static legacyComponentName = ComponentNames.POSTPROCESSING

  constructor(obj3d: PostProcessing, props: PostProcessingDataProps) {
    this.obj3d = obj3d
    this.obj3d.name = 'Post Processing'

    this.normalPass = new NormalPass(Engine.scene, Engine.camera, {
      renderTarget: new WebGLRenderTarget(1, 1, {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBFormat,
        stencilBuffer: false
      })
    })

    this.depthDownsamplingPass = new DepthDownsamplingPass({
      normalBuffer: this.normalPass.texture,
      resolutionScale: 0.5
    })

    if (props.FXAAEffect) {
      this[Effects.FXAAEffect] = new FXAAEffectWrapper(props.FXAAEffect)
    }

    if (props.OutlineEffect) {
      this[Effects.OutlineEffect] = new OutlineEffectWrapper(props.OutlineEffect)
    }

    if (props.SSAOEffect) {
      this[Effects.SSAOEffect] = new SSAOEffectWrapper(props.SSAOEffect, this.normalPass.texture, this.depthDownsamplingPass.texture)
    }

    if (props.DepthOfFieldEffect) {
      this[Effects.DepthOfFieldEffect] = new DepthOfFieldEffectWrapper(props.DepthOfFieldEffect)
    }

    if (props.BloomEffect) {
      this[Effects.BloomEffect] = new BloomEffectWrapper(props.BloomEffect)
    }

    if (props.ToneMappingEffect) {
      this[Effects.ToneMappingEffect] = new ToneMappingEffectWrapper(props.ToneMappingEffect)
    }

    if (props.BrightnessContrastEffect) {
      this[Effects.BrightnessContrastEffect] = new BrightnessContrastEffectWrapper(props.BrightnessContrastEffect)
    }

    if (props.HueSaturationEffect) {
      this[Effects.HueSaturationEffect] = new HueSaturationEffectWrapper(props.HueSaturationEffect)
    }

    if (props.ColorDepthEffect) {
      this[Effects.ColorDepthEffect] = new ColorDepthEffectWrapper(props.ColorDepthEffect)
    }

    if (props.LinearTosRGBEffect) {
      this[Effects.LinearTosRGBEffect] = new LinearTosRGBEffectWrapper(props.LinearTosRGBEffect)
    }
  }

  obj3d: PostProcessing
  normalPass: NormalPass
  depthDownsamplingPass: DepthDownsamplingPass

  [Effects.FXAAEffect]: FXAAEffectWrapper
  [Effects.OutlineEffect]: OutlineEffectWrapper
  [Effects.SSAOEffect]: SSAOEffectWrapper
  [Effects.DepthOfFieldEffect]: DepthOfFieldEffectWrapper
  [Effects.BloomEffect]: BloomEffectWrapper
  [Effects.ToneMappingEffect]: ToneMappingEffectWrapper
  [Effects.BrightnessContrastEffect]: BrightnessContrastEffectWrapper
  [Effects.HueSaturationEffect]: HueSaturationEffectWrapper
  [Effects.ColorDepthEffect]: ColorDepthEffectWrapper
  [Effects.LinearTosRGBEffect]: LinearTosRGBEffectWrapper


  serialize(): object {
    const data  = {}

    if (this[Effects.FXAAEffect]) {
      data[Effects.FXAAEffect] = this[Effects.FXAAEffect].serialize()
    }

    if (this[Effects.OutlineEffect]) {
      data[Effects.OutlineEffect] = this[Effects.OutlineEffect].serialize()
    }

    if (this[Effects.SSAOEffect]) {
      data[Effects.SSAOEffect] = this[Effects.SSAOEffect].serialize()
    }

    if (this[Effects.DepthOfFieldEffect]) {
      data[Effects.DepthOfFieldEffect] = this[Effects.DepthOfFieldEffect].serialize()
    }

    if (this[Effects.BloomEffect]) {
      data[Effects.BloomEffect] = this[Effects.BloomEffect].serialize()
    }

    if (this[Effects.ToneMappingEffect]) {
      data[Effects.ToneMappingEffect] = this[Effects.ToneMappingEffect].serialize()
    }

    if (this[Effects.BrightnessContrastEffect]) {
      data[Effects.BrightnessContrastEffect] = this[Effects.BrightnessContrastEffect].serialize()
    }

    if (this[Effects.HueSaturationEffect]) {
      data[Effects.HueSaturationEffect] = this[Effects.HueSaturationEffect].serialize()
    }

    if (this[Effects.ColorDepthEffect]) {
      data[Effects.ColorDepthEffect] = this[Effects.ColorDepthEffect].serialize()
    }

    if (this[Effects.LinearTosRGBEffect]) {
      data[Effects.LinearTosRGBEffect] = this[Effects.LinearTosRGBEffect].serialize()
    }

    return data
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const PostProcessingComponent = createMappedComponent<PostProcessingData>(ComponentNames.POSTPROCESSING)
