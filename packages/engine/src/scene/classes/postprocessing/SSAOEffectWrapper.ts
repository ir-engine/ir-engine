import { BlendFunction, SSAOEffect, NormalPass } from "postprocessing";
import { Color, Texture } from "three";
import { Engine } from "../../../ecs/classes/Engine";
import { SSAOEffectProps } from "../PostProcessing";

export class SSAOEffectWrapper {
  effect: SSAOEffect
  _active: boolean
  _blendFunction: BlendFunction
  effectProps: SSAOEffectProps
  normalPassTexture: Texture
  normalDepthBuffer: Texture
  _distanceThreshold: number
  _distanceFalloff: number

  constructor(props: SSAOEffectProps, normalPassTexture: Texture, normalDepthBuffer: Texture) {
    this.effectProps = props
    this.normalDepthBuffer = normalDepthBuffer
    this.normalPassTexture = normalPassTexture
    this._distanceThreshold = props.distanceThreshold
    this._distanceFalloff = props.distanceFalloff

    this.active = props.active
  }

  get active(): boolean {
    return this._active
  }

  set active(active: boolean) {
    if (this._active === active) return
    this._active = active

    if (active) {
      this.effect = new SSAOEffect(Engine.camera, this.normalPassTexture, { ...this.effectProps, normalDepthBuffer: this.normalDepthBuffer })
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

  get distanceScaling(): boolean {
    return this.effect.distanceScaling
  }

  set distanceScaling(distanceScaling: boolean) {
    this.effect.distanceScaling = distanceScaling
  }

  get depthAwareUpsampling(): boolean {
    return this.effect.depthAwareUpsampling
  }

  set depthAwareUpsampling(depthAwareUpsampling: boolean) {
    this.effect.depthAwareUpsampling = depthAwareUpsampling
  }

  get samples(): number {
    return this.effect.samples
  }

  set samples(samples: number) {
    this.effect.samples = samples
  }

  get rings(): number {
    return this.effect.rings
  }

  set rings(rings: number) {
    this.effect.rings = rings
  }

  get distanceThreshold(): number {
    return this._distanceThreshold
  }

  set distanceThreshold(distanceThreshold: number) {
    this._distanceThreshold = distanceThreshold
    this.effect.setDistanceCutoff(distanceThreshold, this._distanceFalloff)
  }

  get distanceFalloff(): number {
    return this._distanceFalloff
  }

  set distanceFalloff(distanceFalloff: number) {
    this._distanceFalloff = distanceFalloff
    this.effect.setDistanceCutoff(this._distanceThreshold, distanceFalloff)
  }

  get minRadiusScale(): number {
    return this.effect.ssaoMaterial.uniforms.minRadiusScale.value
  }

  set minRadiusScale(minRadiusScale: number) {
    this.effect.ssaoMaterial.uniforms.minRadiusScale.value = minRadiusScale
  }

  get bias(): number {
    return this.effect.ssaoMaterial.uniforms.bias.value
  }

  set bias(bias: number) {
    this.effect.ssaoMaterial.uniforms.bias.value = bias
  }

  get radius(): number {
    return this.effect.radius
  }

  set radius(radius: number) {
    this.effect.radius = radius
  }

  get intensity(): number {
    return this.effect.ssaoMaterial.uniforms.intensity.value
  }

  set intensity(intensity: number) {
    this.effect.ssaoMaterial.uniforms.intensity.value = intensity
  }

  get fade(): number {
    return this.effect.ssaoMaterial.uniforms.fade.value
  }

  set fade(fade: number) {
    this.effect.ssaoMaterial.uniforms.fade.value = fade
  }

  serialize() {
    return {
      active: this._active,
      blendFunction: this._blendFunction,
      distanceScaling: this.distanceScaling,
      depthAwareUpsampling: this.depthAwareUpsampling,
      samples: this.samples,
      rings: this.rings,
      distanceThreshold: this.distanceThreshold,
      distanceFalloff: this.distanceFalloff,
      minRadiusScale: this.minRadiusScale,
      bias: this.bias,
      radius: this.radius,
      intensity: this.intensity,
      fade: this.fade,
    }
  }
}
