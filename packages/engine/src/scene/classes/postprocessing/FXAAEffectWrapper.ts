import { BlendFunction } from "postprocessing";
import { FXAAEffect } from "../../../renderer/effects/FXAAEffect";
import { FXAAEffectProps } from "../PostProcessing";

export class FXAAEffectWrapper {
  effect: FXAAEffect
  _active: boolean
  _blendFunction: BlendFunction
  effectProps: FXAAEffectProps

  constructor(props: FXAAEffectProps) {
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
      this.effect = new FXAAEffect(this.effectProps)
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