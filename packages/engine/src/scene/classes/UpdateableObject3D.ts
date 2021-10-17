import { Object3D } from 'three'
export default class UpdateableObject3D extends Object3D {
  constructor() {
    super()
  }
  update(dt: number) {}
}
