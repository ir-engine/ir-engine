import { getState } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
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

export default async function XRCameraViewSystem(world: World) {
  const xrRendererState = getState(XRRendererState)

  const execute = () => {
    if (Engine.instance.xrFrame && ReferenceSpace.localFloor) {
      const viewer = Engine.instance.xrFrame.getViewerPose(ReferenceSpace.localFloor)
      if (viewer) {
        for (const view of viewer.views) {
          console.log('XRCamera supported:', view.camera !== null)
          if (view.camera) {
            const cameraImage = xrRendererState.glBinding.value!.getCameraImage(view.camera)
            console.log('WebGLTexture:', cameraImage)
          }
        }
      }
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
