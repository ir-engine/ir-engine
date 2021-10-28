import { BlendFunction, BloomEffect } from "postprocessing";
import { BloomEffectProps } from "../PostProcessing";

export class BloomEffectWrapper {
  effect: BloomEffect
  _active: boolean
  _blendFunction: BlendFunction
  effectProps: BloomEffectProps

  constructor(props: BloomEffectProps) {
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
      this.effect = new BloomEffect(this.effectProps)
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

  get kernelSize(): number {
    return this.effect.blurPass.kernelSize
  }

  set kernelSize(kernelSize: number) {
    this.effect.blurPass.kernelSize = kernelSize
  }

  get luminanceThreshold(): number {
    return this.effect.luminanceMaterial.threshold
  }

  set luminanceThreshold(luminanceThreshold: number) {
    this.effect.luminanceMaterial.threshold = luminanceThreshold
  }

  get luminanceSmoothing(): number {
    return this.effect.luminanceMaterial.smoothing
  }

  set luminanceSmoothing(luminanceSmoothing: number) {
    this.effect.luminanceMaterial.smoothing = luminanceSmoothing
  }

  get intensity(): number {
    return this.effect.intensity
  }

  set intensity(intensity: number) {
    this.effect.intensity = intensity
  }

  serialize() {
    return {
      active: this._active,
      blendFunction: this._blendFunction,
      kernelSize: this.kernelSize,
      luminanceThreshold: this.luminanceThreshold,
      luminanceSmoothing: this.luminanceSmoothing,
      intensity: this.intensity
    }
  }
}
