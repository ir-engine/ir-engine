import { Object3D } from "three"

class VRTrackingReferences {
  head: any
  leftHand: any
  rightHand: any
  constructor() {
    this.head = new Object3D()
    this.leftHand = new Object3D()
    this.leftHand.pointer = 0
    this.leftHand.grip = 0
    this.rightHand = new Object3D()
    this.rightHand.pointer = 0
    this.rightHand.grip = 0
  }
}

export default VRTrackingReferences
