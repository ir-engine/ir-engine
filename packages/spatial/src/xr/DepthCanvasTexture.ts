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

import { CanvasTexture } from 'three'

import { XRCPUDepthInformation } from './XRTypes'

/**
 * Canvas texture to stored depth data obtained from the WebXR API.
 */
export class DepthCanvasTexture extends CanvasTexture {
  constructor(canvas) {
    super(canvas)
  }

  /**
   * Draw depth data to a canvas, also sets the size of the canvas.
   *
   * Uses the camera planes to correctly adjust the values.
   */
  updateDepth(depthInfo: XRCPUDepthInformation) {
    const canvas = this.image as HTMLCanvasElement

    /** check for portrait vs landscape mode, and convert accordingly as WebXR only gives data in landscape orientation */
    const windowIsPortrait = window.innerHeight > window.innerWidth ? 1 : 0

    canvas.width = windowIsPortrait ? depthInfo.height : depthInfo.width
    canvas.height = windowIsPortrait ? depthInfo.width : depthInfo.height

    const context = canvas.getContext('2d')!
    const image = context.getImageData(0, 0, canvas.width, canvas.height)

    for (let x = 0; x < depthInfo.width; x++) {
      for (let y = 0; y < depthInfo.height; y++) {
        const _x = windowIsPortrait ? y / depthInfo.height : x / depthInfo.width
        const _y = windowIsPortrait ? x / depthInfo.width : y / depthInfo.height
        let distance = depthInfo.getDepthInMeters(_x, _y)
        const j = windowIsPortrait ? (x * depthInfo.height + y) * 4 : (y * depthInfo.width + x) * 4

        const val = Math.ceil(distance * 255)
        image.data[j] = val
        image.data[j + 1] = val
        image.data[j + 2] = val
        image.data[j + 3] = 255
      }
    }

    context.putImageData(image, 0, 0)
    this.needsUpdate = true
  }
}
