import { Object3D, CircleBufferGeometry, MeshStandardMaterial, Mesh, Color } from 'three'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'

export default class GroundPlane extends Object3D {
  _receiveShadow: boolean
  mesh: Mesh
  generateNavmesh: boolean

  constructor() {
    super()
    this._receiveShadow = true
    const mesh = new Mesh(
      new CircleBufferGeometry(1000, 32),
      new MeshStandardMaterial({
        roughness: 1,
        metalness: 0
      })
    )

    mesh.name = 'GroundPlaneMesh'
    mesh.position.y = -0.05
    mesh.rotation.x = -Math.PI / 2

    this.mesh = mesh
    this.mesh.receiveShadow = this.receiveShadow

    mesh.userData = {
      type: 'ground',
      collisionLayer: CollisionGroups.Ground,
      collisionMask: CollisionGroups.Default
    }

    this.add(this.mesh)
  }

  get color() {
    return (this.mesh.material as MeshStandardMaterial).color
  }

  set color(color: Color) {
    ;(this.mesh.material as MeshStandardMaterial).color = color
  }

  // @ts-ignore
  get receiveShadow() {
    return this._receiveShadow
  }

  set receiveShadow(value) {
    this._receiveShadow = value
    if (this.mesh) {
      this.mesh.receiveShadow = value
      const material = this.mesh.material
      if (Array.isArray(material)) {
        for (let i = 0; i < material.length; i++) {
          material[i].needsUpdate = true
        }
      } else {
        material.needsUpdate = true
      }
    }
  }

  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.mesh)
    }
    super.copy(source, recursive)
    if (recursive) {
      const meshIndex = source.children.indexOf(source.mesh)
      if (meshIndex !== -1) {
        ;(this.mesh as any) = this.children[meshIndex]
      }
    }
    this.color.copy(source.color)
    return this
  }
}
