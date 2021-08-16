import { Object3D, CircleBufferGeometry, MeshStandardMaterial, Mesh, Color } from 'three'
export default class GroundPlane extends Object3D {
  static _geometry = new CircleBufferGeometry(4000, 32)
  _receiveShadow: boolean
  mesh: Mesh
  constructor() {
    super()
    this._receiveShadow = true
    const material = new MeshStandardMaterial({
      roughness: 1,
      metalness: 0,
      color: '#5DE336'
    })
    const mesh = new Mesh(GroundPlane._geometry, material)
    mesh.name = 'GroundPlaneMesh'
    mesh.position.y = -0.05
    mesh.rotation.x = -Math.PI / 2
    this.mesh = mesh
    this.mesh.receiveShadow = this.receiveShadow
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
