import { getState } from '@etherealengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { XRRendererState } from './WebXRManager'
import { ReferenceSpace } from './XRState'

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
