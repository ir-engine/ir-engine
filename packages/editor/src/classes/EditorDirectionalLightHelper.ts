// @ts-nocheck
import { BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial, Object3D } from 'three'

import { addIsHelperFlag } from '@xrengine/engine/src/scene/functions/addIsHelperFlag'

export default class EditorDirectionalLightHelper extends Object3D {
  light: any
  color: any
  lightPlane: Line<BufferGeometry, LineBasicMaterial>
  targetLine: Line<BufferGeometry, LineBasicMaterial>
  name: string
  constructor(light, size?, color?) {
    super()
    this.name = 'EditorDirectionalLightHelper'
    this.light = light
    this.color = color
    if (size === undefined) size = 1
    let geometry = new BufferGeometry()
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute([-size, size, 0, size, size, 0, size, -size, 0, -size, -size, 0, -size, size, 0], 3)
    )
    const material = new LineBasicMaterial({ fog: false })
    this.lightPlane = new Line(geometry, material)
    this.lightPlane.layers.set(1)
    this.add(this.lightPlane)
    geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, 1], 3))
    this.targetLine = new Line(geometry, material)
    this.targetLine.layers.set(1)
    this.add(this.targetLine)
    this.update()
    addIsHelperFlag(this)
  }
  update() {
    if (this.color !== undefined) {
      this.lightPlane.material.color.set(this.color)
      this.targetLine.material.color.set(this.color)
    } else {
      this.lightPlane.material.color.copy(this.light.color)
      this.targetLine.material.color.copy(this.light.color)
    }
  }
  dispose() {
    this.lightPlane.geometry.dispose()
    this.lightPlane.material.dispose()
    this.targetLine.geometry.dispose()
    this.targetLine.material.dispose()
  }
}
