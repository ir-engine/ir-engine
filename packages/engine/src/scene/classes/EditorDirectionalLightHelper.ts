import {
  LineSegments,
  Object3D,
  BufferGeometry,
  LineBasicMaterial,
  Float32BufferAttribute,
  ColorRepresentation,
  DirectionalLight
} from 'three'
import { addIsHelperFlag } from '../functions/addIsHelperFlag'

export default class EditorDirectionalLightHelper extends Object3D {
  color: ColorRepresentation
  lightPlane: LineSegments<BufferGeometry, LineBasicMaterial>
  targetLine: LineSegments<BufferGeometry, LineBasicMaterial>
  name: string

  constructor(size?: number, color?: ColorRepresentation) {
    super()
    this.name = 'directional-light-helper'
    if (color) this.color = color

    if (size === undefined) size = 1

    const material = new LineBasicMaterial()

    let geometry = new BufferGeometry()
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute(
        [
          -size,
          size,
          0,
          size,
          size,
          0,
          size,
          size,
          0,
          size,
          -size,
          0,
          size,
          -size,
          0,
          -size,
          -size,
          0,
          -size,
          -size,
          0,
          -size,
          size,
          0,
          -size,
          size,
          0,
          size,
          -size,
          0,
          size,
          size,
          0,
          -size,
          -size,
          0
        ],
        3
      )
    )

    this.lightPlane = new LineSegments(geometry, material)
    this.lightPlane.layers.set(1)
    this.add(this.lightPlane)

    geometry = new BufferGeometry()
    const t = size * 0.1
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute([-t, t, 0, 0, 0, 1, t, t, 0, 0, 0, 1, t, -t, 0, 0, 0, 1, -t, -t, 0, 0, 0, 1], 3)
    )

    this.targetLine = new LineSegments(geometry, material)
    this.targetLine.layers.set(1)
    this.add(this.targetLine)

    addIsHelperFlag(this)
  }

  update() {
    if (this.color !== undefined) {
      this.lightPlane.material.color.set(this.color)
      this.targetLine.material.color.set(this.color)
    } else {
      this.lightPlane.material.color.copy((this.parent as DirectionalLight)!.color)
      this.targetLine.material.color.copy((this.parent as DirectionalLight)!.color)
    }
  }

  dispose() {
    this.lightPlane.geometry.dispose()
    this.lightPlane.material.dispose()
    this.targetLine.geometry.dispose()
    this.targetLine.material.dispose()
  }
}
