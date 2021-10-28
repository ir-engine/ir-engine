import { BlendFunction } from "postprocessing";
import { LinearTosRGBEffect } from "../../../renderer/effects/LinearTosRGBEffect";
import { LinearTosRGBEffectProps } from "../PostProcessing";

export class LinearTosRGBEffectWrapper {
  effect: LinearTosRGBEffect
  _active: boolean
  _blendFunction: BlendFunction
  effectProps: LinearTosRGBEffectProps

  constructor(props: LinearTosRGBEffectProps) {
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
      this.effect = new LinearTosRGBEffect(this.effectProps)
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

  serialize() {
    return {
      active: this._active,
      blendFunction: this._blendFunction
    }
  }
}