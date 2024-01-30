/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
