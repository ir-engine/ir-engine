import { BlendFunction, HueSaturationEffect } from "postprocessing";
import { HueSaturationEffectProps } from "../PostProcessing";

export class HueSaturationEffectWrapper {
  effect: HueSaturationEffect
  _active: boolean
  _blendFunction: BlendFunction
  effectProps: HueSaturationEffectProps
  _hue: number

  constructor(props: HueSaturationEffectProps) {
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
      this.effect = new HueSaturationEffect(this.effectProps)
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

  get hue(): number {
    return this._hue
  }

  set hue(hue: number) {
    this._hue = hue
    this.effect.setHue(hue * Math.PI / 180)
  }

  get saturation(): number {
    return this.effect.uniforms.get('saturation').value
  }

  set saturation(saturation: number) {
    this.effect.uniforms.get('saturation').value = saturation
  }

  serialize() {
    return {
      active: this._active,
      blendFunction: this._blendFunction,
      saturation: this.saturation,
      hue: this.hue
    }
  }
}
