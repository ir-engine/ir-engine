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

import { defineSystem } from '../ecs/functions/SystemFunctions'

/**
 * https://github.com/immersive-web/raw-camera-access/blob/main/explainer.md
 */

declare global {
  interface XRView {
    camera: XRCamera
  }

  interface XRCamera {
    width: number
    height: number
  }

  interface XRWebGLBinding {
    getCameraImage(camera: XRCamera): WebGLTexture
  }
}

/** @todo - do something with camera API */

// const execute = () => {
// const xrRendererState = getState(XRRendererState)
//   if (Engine.instance.xrFrame && ReferenceSpace.localFloor) {
//     const viewer = Engine.instance.xrFrame.getViewerPose(ReferenceSpace.localFloor)
//     if (viewer) {
//       for (const view of viewer.views) {
//         // console.log('XRCamera supported:', view.camera !== null && xrRendererState.glBinding !== null)
//         if (view.camera && xrRendererState.glBinding) {
//           const cameraImage = xrRendererState.glBinding?.getCameraImage(view.camera)
//           // console.log('WebGLTexture:', cameraImage)
//         }
//       }
//     }
//   }
// }

const execute = () => {}

export const XRCameraViewSystem = defineSystem({
  uuid: 'ee.engine.XRCameraViewSystem',
  execute
})
