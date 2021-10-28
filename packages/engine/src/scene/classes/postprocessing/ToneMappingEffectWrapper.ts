import { BlendFunction, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { ToneMappingEffectProps } from "../PostProcessing";

export class ToneMappingEffectWrapper {
  effect: ToneMappingEffect
  _active: boolean
  _blendFunction: BlendFunction
  effectProps: ToneMappingEffectProps

  constructor(props: ToneMappingEffectProps) {
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
      this.effect = new ToneMappingEffect(this.effectProps)
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

  get adaptive(): boolean {
    return this.effect.getMode() === ToneMappingMode.REINHARD2_ADAPTIVE
  }

  set adaptive(adaptive: boolean) {
    this.effect.setMode(adaptive ? ToneMappingMode.REINHARD2_ADAPTIVE : ToneMappingMode.REINHARD)
  }

  get resolution(): number {
    return this.effect.resolution
  }

  set resolution(resolution: number) {
    this.effect.resolution = resolution
  }

  get middleGrey(): number {
    return this.effect.uniforms.get('middleGrey').value
  }

  set middleGrey(middleGrey: number) {
    this.effect.uniforms.get('middleGrey').value = middleGrey
  }

  get maxLuminance(): number {
    return this.effect.uniforms.get('maxLuminance').value
  }

  set maxLuminance(maxLuminance: number) {
    this.effect.uniforms.get('maxLuminance').value = maxLuminance
  }

  get averageLuminance(): number {
    return this.effect.uniforms.get('averageLuminance').value
  }

  set averageLuminance(averageLuminance: number) {
    this.effect.uniforms.get('averageLuminance').value = averageLuminance
  }

  get adaptationRate(): number {
    return this.effect.adaptiveLuminancePass.adaptationRate
  }

  set adaptationRate(adaptationRate: number) {
    this.effect.adaptiveLuminancePass.adaptationRate = adaptationRate
  }

  serialize() {
    return {
      active: this._active,
      blendFunction: this._blendFunction,
      adaptive: this.adaptive,
      resolution: this.resolution,
      middleGrey: this.middleGrey,
      maxLuminance: this.maxLuminance,
      averageLuminance: this.averageLuminance,
      adaptationRate: this.adaptationRate,
    }
  }
}