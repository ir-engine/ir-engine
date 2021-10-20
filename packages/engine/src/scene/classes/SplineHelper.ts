import { BoxGeometry, Mesh, MeshLambertMaterial, Object3D } from 'three'

export default class SplineHelper extends Object3D {
  constructor() {
    super()
    const geometry = new BoxGeometry(0.1, 0.1, 0.1)
    const material = new MeshLambertMaterial({ color: Math.random() * 0xffffff })
    const object = new Mesh(geometry, material)
    super.add(object)
  }
}
