import { BlendFunction, BrightnessContrastEffect } from "postprocessing";
import { BrightnessContrastEffectProps } from "../PostProcessing";

export class BrightnessContrastEffectWrapper {
  effect: BrightnessContrastEffect
  _active: boolean
  _blendFunction: BlendFunction
  effectProps: BrightnessContrastEffectProps

  constructor(props: BrightnessContrastEffectProps) {
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
      this.effect = new BrightnessContrastEffect(this.effectProps)
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

  get brightness(): number {
    return this.effect.uniforms.get('brightness').value
  }

  set brightness(brightness: number) {
    this.effect.uniforms.get('brightness').value = brightness
  }

  get contrast(): number {
    return this.effect.uniforms.get('contrast').value
  }

  set contrast(contrast: number) {
    this.effect.uniforms.get('contrast').value = contrast
  }

  serialize() {
    return {
      active: this._active,
      blendFunction: this._blendFunction,
      brightness: this.brightness,
      contrast: this.contrast
    }
  }
}
