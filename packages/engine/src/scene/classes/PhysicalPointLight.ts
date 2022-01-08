import { Object3D, PointLight } from 'three'

import createShadowMapResolutionProxy from '../../scene/functions/createShadowMapResolutionProxy'

export default class PhysicalPointLight extends PointLight {
  shadowMapResolution: any
  constructor() {
    super()
    this.decay = 2
    this.castShadow = true
    this.shadowMapResolution = createShadowMapResolutionProxy(this)
  }
  get range() {
    return this.distance
  }
  set range(value) {
    this.distance = value
  }
  // @ts-ignore
  get shadowBias() {
    return this.shadow.bias
  }
  // @ts-ignore
  set shadowBias(value) {
    this.shadow.bias = value
  }
  get shadowRadius() {
    return this.shadow.radius
  }
  set shadowRadius(value) {
    this.shadow.radius = value
  }
  copy(source, recursive = true) {
    // Override PointLight's copy method and pass the recursive parameter so we can avoid cloning children.
    Object3D.prototype.copy.call(this, source, false)
    this.color.copy(source.color)
    this.intensity = source.intensity
    this.distance = source.distance
    this.decay = source.decay
    this.shadow.copy(source.shadow)
    if (recursive) {
      this.remove(this.target as any)
      for (let i = 0; i < source.children.length; i++) {
        const child = source.children[i]
        if (child === source.target) {
          this.target = child.clone()
          this.add(this.target as any)
        } else {
          this.add(child.clone())
        }
      }
    }
    return this
  }
  target(target: any) {
    throw new Error('Method not implemented.')
  }
}
