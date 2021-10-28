import { BlendFunction, DepthOfFieldEffect } from "postprocessing";
import { Engine } from "../../../ecs/classes/Engine";
import { DepthOfFieldEffectProps } from "../PostProcessing";

export class DepthOfFieldEffectWrapper {
  effect: DepthOfFieldEffect
  _active: boolean
  _blendFunction: BlendFunction
  effectProps: DepthOfFieldEffectProps

  constructor(props: DepthOfFieldEffectProps) {
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
      this.effect = new DepthOfFieldEffect(Engine.camera, this.effectProps)
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

  get bokehScale(): number {
    return this.effect.bokehScale
  }

  set bokehScale(bokehScale: number) {
    this.effect.bokehScale = bokehScale
  }

  get focusDistance(): number {
    return this.effect.circleOfConfusionMaterial.uniforms.focusDistance.value
  }

  set focusDistance(focusDistance: number) {
    this.effect.circleOfConfusionMaterial.uniforms.focusDistance.value = focusDistance
  }

  get focalLength(): number {
    return this.effect.circleOfConfusionMaterial.uniforms.focalLength.value
  }

  set focalLength(focalLength: number) {
    this.effect.circleOfConfusionMaterial.uniforms.focalLength.value = focalLength
  }

  serialize() {
    return {
      active: this._active,
      blendFunction: this._blendFunction,
      bokehScale: this.bokehScale,
      focusDistance: this.focusDistance,
      focalLength: this.focalLength
    }
  }
}
