import { BlendFunction, OutlineEffect } from "postprocessing";
import { Color } from "three";
import { Engine } from "../../../ecs/classes/Engine";
import { OutlineEffectProps } from "../PostProcessing";

export class OutlineEffectWrapper {
  effect: OutlineEffect
  _active: boolean
  _blendFunction: BlendFunction
  effectProps: OutlineEffectProps

  constructor(props: OutlineEffectProps) {
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
      this.effect = new OutlineEffect(Engine.scene, Engine.camera, this.effectProps)
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

  get edgeStrength(): number {
    return this.effect.uniforms.get('edgeStrength').value
  }

  set edgeStrength(edgeStrength: number) {
    this.effectProps.edgeStrength = edgeStrength
    this.effect.uniforms.get('edgeStrength').value = edgeStrength
  }

  get pulseSpeed(): number {
    return this.effect.pulseSpeed
  }

  set pulseSpeed(pulseSpeed: number) {
    this.effectProps.pulseSpeed = pulseSpeed
    this.effect.pulseSpeed = pulseSpeed
  }

  get visibleEdgeColor(): number {
    return this.effect.uniforms.get('visibleEdgeColor').value.getHex()
  }

  set visibleEdgeColor(visibleEdgeColor: number) {
    this.effectProps.visibleEdgeColor = visibleEdgeColor
    this.effect.uniforms.get('visibleEdgeColor').value = new Color(visibleEdgeColor)
  }

  get hiddenEdgeColor(): number {
    return this.effect.uniforms.get('hiddenEdgeColor').value.getHex()
  }

  set hiddenEdgeColor(hiddenEdgeColor: number) {
    this.effectProps.hiddenEdgeColor = hiddenEdgeColor
    this.effect.uniforms.get('hiddenEdgeColor').value = new Color(hiddenEdgeColor)
  }

  get resolutionScale(): number {
    return this.effect.resolution.scale
  }

  set resolutionScale(resolutionScale: number) {
    this.effectProps.resolutionScale = resolutionScale
    this.effect.resolution.scale = resolutionScale
  }

  get width(): number {
    return this.effect.resolution.width
  }

  set width(width: number) {
    this.effectProps.width = width
    this.effect.resolution.width = width
  }

  get height(): number {
    return this.effect.resolution.height
  }

  set height(height: number) {
    this.effectProps.height = height
    this.effect.resolution.height = height
  }

  get kernelSize(): number {
    return this.effect.blurPass.kernelSize
  }

  set kernelSize(kernelSize: number) {
    this.effectProps.kernelSize = kernelSize
    this.effect.blurPass.kernelSize = kernelSize
  }

  get blur(): boolean {
    return this.effect.blur
  }

  set blur(blur: boolean) {
    this.effectProps.blur = blur
    this.effect.blur = blur
  }

  get xRay(): boolean {
    return this.effect.xRay
  }

  set xRay(xRay: boolean) {
    this.effectProps.xRay = xRay
    this.effect.xRay = xRay
  }

  serialize() {
    return {
      active: this._active,
      blendFunction: this._blendFunction,
      edgeStrength: this.edgeStrength,
      pulseSpeed: this.pulseSpeed,
      visibleEdgeColor: this.visibleEdgeColor,
      hiddenEdgeColor: this.hiddenEdgeColor,
      resolutionScale: this.resolutionScale,
      width: this.width,
      height: this.height,
      blur: this.blur,
      kernelSize: this.kernelSize,
      xRay: this.xRay
    }
  }
}