import VRTrackingReferences from "./VRTrackingReferences"

class PoseManager {
  vrTransforms: any
  referencePlayerHeightHmd: number
  referencePlayerWidthWrist: number
  playerHeightHmd: number
  playerWidthWrist: number
  constructor(rig) {
    this.vrTransforms = new VRTrackingReferences()

    this.referencePlayerHeightHmd = 1.7
    this.referencePlayerWidthWrist = 1.39
    this.playerHeightHmd = 1.7
    this.playerWidthWrist = 1.39
  }
}

export default PoseManager
