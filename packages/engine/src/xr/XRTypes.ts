/**
 * These currently have no typescript implementation
 */

export type XRDepthInformation = {
  height: number
  normDepthBufferFromNormView: XRRigidTransform
  rawValueToMeters: number
  width: number
}

export type XRCPUDepthInformation = XRDepthInformation & {
  data: ArrayBuffer
  getDepthInMeters: (x: number, y: number) => number
}
