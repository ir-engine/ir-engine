import { Matrix4 } from 'three'

import { createActionQueue, getState } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { XRRendererState } from './WebXRManager'
import { ReferenceSpace, XRAction, XRState } from './XRState'

declare global {
  interface XRWebGLSubImage {
    motionVectorTexture: WebGLTexture
    motionVectorTextureWidth: number
    motionVectorTextureHeight: number
  }
  interface XRView {
    viewMatrix: Float32Array
  }
}

// https://github.com/dannysu/webxr-samples/blob/c5d29972a52c23231fe3620d4b30f5925ff9b29e/layers-samples/proj-spacewarp.html

export const spacewarp = () => {
  const xrState = getState(XRState)
  const xrRendererState = getState(XRRendererState)

  let xrMotionFramebuffer = null as WebGLFramebuffer | null

  const prevMatrices = [] as Array<{ projectionMatrix: Matrix4; viewMatrix: Matrix4 }>

  const sessionChangedQueue = createActionQueue(XRAction.sessionChanged.matches)

  return () => {
    const gl = EngineRenderer.instance.renderer.getContext() as WebGL2RenderingContext

    for (const action of sessionChangedQueue()) {
      xrMotionFramebuffer = gl.createFramebuffer()
    }

    const frame = Engine.instance.xrFrame
    if (!frame) return

    /** @todo support spacewarp without multiview */
    const multiview = gl.getExtension('OVR_multiview2') ?? gl.getExtension('OCULUS_multiview')
    if (!multiview) return

    const glBinding = xrRendererState.glBinding.value!

    // render spacewarp

    const layer = frame.session.renderState.layers?.[0] as XRProjectionLayer
    if (!layer) return

    const referenceSpace = ReferenceSpace.origin
    if (!referenceSpace) return

    const pose = frame.getViewerPose(referenceSpace)

    if (!pose) return
    const views = pose.views

    for (const view of views) {
      const glLayer = glBinding.getViewSubImage(layer, view)
      gl.bindFramebuffer(gl.FRAMEBUFFER, xrMotionFramebuffer)

      const motionViews = []
      if (motionViews.length == 0) {
        // SpaceWarp: Make sure to avoid doing antialiasing on the motion vector
        multiview.framebufferTextureMultiviewOVR(
          gl.DRAW_FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          glLayer.motionVectorTexture,
          0,
          0,
          2
        )
        multiview.framebufferTextureMultiviewOVR(
          gl.DRAW_FRAMEBUFFER,
          gl.DEPTH_ATTACHMENT,
          glLayer.depthStencilTexture,
          0,
          0,
          2
        )

        gl.enable(gl.SCISSOR_TEST)
        gl.scissor(0, 0, glLayer.motionVectorTextureWidth, glLayer.motionVectorTextureHeight)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.disable(gl.SCISSOR_TEST)
      }

      let prevProjectionMatrix = null
      let prevViewMatrix = null
    }

    // SpaceWarp: Remember the previous projection and view matrices.
    // Needed for calculating the motion vector.
    for (let i = 0; i < views.length; i++) {
      const view = views[i]
      prevMatrices[i].projectionMatrix.fromArray(view.projectionMatrix)
      prevMatrices[i].viewMatrix.fromArray(view.viewMatrix)
    }
  }
}
