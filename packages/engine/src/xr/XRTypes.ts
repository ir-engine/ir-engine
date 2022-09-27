/**
 * These currently have no typescript implementation
 */

export type XRDepthInformation = {
  height: number
  normTextureFromNormView: XRRigidTransform // ???? this is the one in the code
  normDepthBufferFromNormView: XRRigidTransform // ???? this is the one in the mozilla docs
  rawValueToMeters: number
  width: number
}

export type XRCPUDepthInformation = XRDepthInformation & {
  data: ArrayBuffer
  getDepthInMeters: (x: number, y: number) => number
}
