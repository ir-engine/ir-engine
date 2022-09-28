/**
 * Credit: https://github.com/tentone/webxr-occlusion-lighting/blob/main/src/texture/DepthDataTexture.js
 */
import { DataTexture, LinearFilter, RGFormat, UnsignedByteType } from 'three'

import { XRCPUDepthInformation } from './XRTypes'

/**
 * Stores the raw depth values in a 16 bit value packed texture.
 *
 * The distance to the camera is stored in millimeters.
 *
 * This depth has to be unpacked in shader and multiplied by the normalization matrix to obtain rectified UV coordinates.
 */
export class DepthDataTexture extends DataTexture {
  constructor(width, height) {
    const data = new Uint8Array(width * height)

    super(data, width, height, RGFormat, UnsignedByteType)

    this.magFilter = LinearFilter
    this.minFilter = LinearFilter
  }

  /**
   * Update the texture with new depth data.
   *
   * Depth data is retrieved from the WebXR API.
   *
   * @param {XRCPUDepthInformation} depthInfo
   */
  updateDepth(depthInfo: XRCPUDepthInformation) {
    const dataBuffer = depthInfo.data
    // ImageData is incorrectly type as readonly
    // @ts-ignore
    this.image.data = new Uint8Array(dataBuffer)
    this.needsUpdate = true
  }
}
