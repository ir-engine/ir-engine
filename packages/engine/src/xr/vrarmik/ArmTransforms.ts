import { Object3D } from "three"

export class ArmTransforms {
  transform: any
  upperArm: any
  lowerArm: any
  hand: any
  constructor() {
    this.transform = new Object3D()
    this.upperArm = new Object3D()
    this.lowerArm = new Object3D()
    this.hand = new Object3D()

    this.transform.add(this.upperArm)
    this.upperArm.add(this.lowerArm)
    this.lowerArm.add(this.hand)
  }
}
