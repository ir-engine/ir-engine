import { MeshBasicMaterial, ShaderMaterial, BufferAttribute, RepeatWrapping, DoubleSide, Object3D } from 'three'

export class DissolveEffect {
  time = 0
  object
  maxHeight = 1
  minHeight = 0
  step = 0.001

  constructor(object: Object3D, minHeight: number, maxHeight: number) {
    object.traverse((child) => {
      if (child['material']) {
        child.visible = true
      }
    })
    this.object = object
    this.minHeight = minHeight - 1
    this.maxHeight = maxHeight + 1
    this.step = (this.maxHeight - this.minHeight) / 150
    this.time = this.minHeight
  }

  dispose() {}

  update(dt) {
    if (this.time <= this.maxHeight) {
      this.object.traverse((child) => {
        if (child['material'] && child.name !== 'growing_obj') {
          child.material.uniforms.time.value = this.time
        }
      })

      this.time += this.step
      return false
    }
    this.dispose()
    return true
  }
}
