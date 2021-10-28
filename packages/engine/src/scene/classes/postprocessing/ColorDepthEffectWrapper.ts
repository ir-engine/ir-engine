import { BlendFunction, ColorDepthEffect } from "postprocessing";
import { ColorDepthEffectProps } from "../PostProcessing";

export class ColorDepthEffectWrapper {
  effect: ColorDepthEffect
  _active: boolean
  _blendFunction: BlendFunction
  effectProps: ColorDepthEffectProps

  constructor(props: ColorDepthEffectProps) {
    this.effectProps = props

    this.active = props.active
  }

  get active(): boolean {
    return this._active
  }

  set active(active: boolean) {
    if (this._active === active) return
    this._active = active

    if (active) {
      this.effect = new ColorDepthEffect(this.effectProps)
    } else {
      this.effect?.dispose()
    }
  }

  get blendFunction(): BlendFunction {
    return this.effect.blendMode.getBlendFunction()
  }

  set blendFunction(blendFunction: BlendFunction) {
    this.effect.blendMode.setBlendFunction(blendFunction)
  }

  get bits(): number {
    return this.effect.getBitDepth()
  }

  set bits(bits: number) {
    this.effect.setBitDepth(bits)
  }

  serialize() {
    return {
      active: this._active,
      blendFunction: this._blendFunction,
      bits: this.bits
    }
  }
}
