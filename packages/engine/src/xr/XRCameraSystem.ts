import { ArrayCamera, PerspectiveCamera, Vector3, Vector4 } from 'three'

import { createActionQueue, defineState, getState } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { XRRendererState } from './WebXRManager'
import { XRAction, XRState } from './XRState'

export const XRCameraState = defineState({
  name: 'XRCameraState',
  initial: {
    cameraVR: null! as ArrayCamera,
    cameras: [] as PerspectiveCamera[]
  }
})

//

const cameraLPos = new Vector3()
const cameraRPos = new Vector3()

/**
 * Assumes 2 cameras that are parallel and share an X-axis, and that
 * the cameras' projection and world matrices have already been set.
 * And that near and far planes are identical for both cameras.
 * Visualization of scope technique: https://computergraphics.stackexchange.com/a/4765
 */
function setProjectionFromUnion(camera, cameraL, cameraR) {
  cameraLPos.setFromMatrixPosition(cameraL.matrixWorld)
  cameraRPos.setFromMatrixPosition(cameraR.matrixWorld)

  const ipd = cameraLPos.distanceTo(cameraRPos)

  const projL = cameraL.projectionMatrix.elements
  const projR = cameraR.projectionMatrix.elements

  // VR systems will have identical far and near planes, and
  // most likely identical top and bottom frustum extents.
  // Use the left camera for these values.
  const near = projL[14] / (projL[10] - 1)
  const far = projL[14] / (projL[10] + 1)
  const topFov = (projL[9] + 1) / projL[5]
  const bottomFov = (projL[9] - 1) / projL[5]

  const leftFov = (projL[8] - 1) / projL[0]
  const rightFov = (projR[8] + 1) / projR[0]
  const left = near * leftFov
  const right = near * rightFov

  // Calculate the new camera's position offset from the
  // left camera. xOffset should be roughly half `ipd`.
  const zOffset = ipd / (-leftFov + rightFov)
  const xOffset = zOffset * -leftFov

  // TODO: Better way to apply scope offset?
  cameraL.matrixWorld.decompose(camera.position, camera.quaternion, camera.scale)
  camera.translateX(xOffset)
  camera.translateZ(zOffset)
  camera.matrixWorld.compose(camera.position, camera.quaternion, camera.scale)
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert()

  // Find the union of the frustum values of the cameras and scale
  // the values so that the near plane's position does not change in world space,
  // although must now be relative to the new union camera.
  const near2 = near + zOffset
  const far2 = far + zOffset
  const left2 = left - xOffset
  const right2 = right + (ipd - xOffset)
  const top2 = ((topFov * far) / far2) * near2
  const bottom2 = ((bottomFov * far) / far2) * near2

  camera.projectionMatrix.makePerspective(left2, right2, top2, bottom2, near2, far2)
}

function updateCamera(camera, parent) {
  if (parent === null) {
    camera.matrixWorld.copy(camera.matrix)
  } else {
    camera.matrixWorld.multiplyMatrices(parent.matrixWorld, camera.matrix)
  }

  camera.matrixWorldInverse.copy(camera.matrixWorld).invert()
}

function updatePoseFromXRFrame() {
  const xrFrame = Engine.instance.xrFrame
  const renderer = EngineRenderer.instance.renderer
  const referenceSpace = getState(XRState).originReferenceSpace.value
  const pose = referenceSpace && xrFrame!.getViewerPose(referenceSpace)

  if (pose) {
    const views = pose.views
    const xrRendererState = getState(XRRendererState)
    const glBaseLayer = xrRendererState.glBaseLayer.value
    const glBinding = xrRendererState.glBinding.value
    const glProjLayer = xrRendererState.glProjLayer.value
    const newRenderTarget = xrRendererState.newRenderTarget.value

    if (glBaseLayer !== null) {
      // @ts-ignore setRenderTargetFramebuffer is not in the type definition
      renderer.setRenderTargetFramebuffer(newRenderTarget, glBaseLayer.framebuffer)
      renderer.setRenderTarget(newRenderTarget)
    }

    let cameraVRNeedsUpdate = false

    // check if it's necessary to rebuild cameraVR's camera list
    const xrCameraState = getState(XRCameraState)
    const cameraVR = xrCameraState.cameraVR.value
    const cameras = xrCameraState.cameras.value

    if (views.length !== cameraVR.cameras.length) {
      cameraVR.cameras.length = 0
      cameraVRNeedsUpdate = true
    }

    for (let i = 0; i < views.length; i++) {
      const view = views[i]

      let viewport: XRViewport

      if (glBaseLayer !== null) {
        viewport = glBaseLayer.getViewport(view)!
      } else {
        const glSubImage = glBinding!.getViewSubImage(glProjLayer!, view)
        viewport = glSubImage.viewport

        // For side-by-side projection, we only produce a single texture for both eyes.
        if (i === 0) {
          // @ts-ignore setRenderTargetTextures is not in the type definition
          renderer.setRenderTargetTextures(
            newRenderTarget,
            glSubImage.colorTexture,
            glProjLayer!.ignoreDepthValues ? undefined : glSubImage.depthStencilTexture
          )

          renderer.setRenderTarget(newRenderTarget)
        }
      }

      let camera = cameras[i]

      if (camera === undefined) {
        camera = new PerspectiveCamera()
        camera.layers.enable(i)
        camera.viewport = new Vector4()
        cameras[i] = camera
      }

      camera.matrix.fromArray(view.transform.matrix)
      camera.projectionMatrix.fromArray(view.projectionMatrix)
      camera.viewport.set(viewport.x, viewport.y, viewport.width, viewport.height)

      if (i === 0) {
        cameraVR.matrix.copy(camera.matrix)
      }

      if (cameraVRNeedsUpdate === true) {
        cameraVR.cameras.push(camera)
      }
    }
  }
}

let _currentDepthNear = null as number | null
let _currentDepthFar = null as number | null

export function updateXRCamera(camera = Engine.instance.currentWorld.camera) {
  const xrState = getState(XRState)
  const session = xrState.session.value
  if (session === null) return

  updatePoseFromXRFrame()

  const xrCameraState = getState(XRCameraState)
  const cameraVR = xrCameraState.cameraVR.value
  const cameraL = xrCameraState.cameras.value[0]
  const cameraR = xrCameraState.cameras.value[1]

  cameraVR.near = cameraR.near = cameraL.near = camera.near
  cameraVR.far = cameraR.far = cameraL.far = camera.far

  if (_currentDepthNear !== cameraVR.near || _currentDepthFar !== cameraVR.far) {
    // Note that the new renderState won't apply until the next frame. See #18320

    session.updateRenderState({
      depthNear: cameraVR.near,
      depthFar: cameraVR.far
    })

    _currentDepthNear = cameraVR.near
    _currentDepthFar = cameraVR.far
  }

  const parent = camera.parent
  const cameras = cameraVR.cameras

  updateCamera(cameraVR, parent)

  for (let i = 0; i < cameras.length; i++) {
    updateCamera(cameras[i], parent)
  }

  cameraVR.matrixWorld.decompose(cameraVR.position, cameraVR.quaternion, cameraVR.scale)

  // update user camera and its children

  camera.matrix.copy(cameraVR.matrix)
  camera.matrix.decompose(camera.position, camera.quaternion, camera.scale)

  const children = camera.children

  for (let i = 0, l = children.length; i < l; i++) {
    children[i].updateMatrixWorld(true)
  }

  // update projection matrix for proper view frustum culling

  if (cameras.length === 2) {
    setProjectionFromUnion(cameraVR, cameraL, cameraR)
  } else {
    // assume single camera setup (AR)

    cameraVR.projectionMatrix.copy(cameraL.projectionMatrix)
  }
}

export default async function XRCameraSystem(world: World) {
  const xrCameraState = getState(XRCameraState)

  const cameraL = new PerspectiveCamera()
  cameraL.layers.enable(1)
  cameraL.viewport = new Vector4()

  const cameraR = new PerspectiveCamera()
  cameraR.layers.enable(2)
  cameraR.viewport = new Vector4()

  const cameras = [cameraL, cameraR]

  const cameraVR = new ArrayCamera()
  cameraVR.layers.enable(1)
  cameraVR.layers.enable(2)

  xrCameraState.cameraVR.set(cameraVR)
  xrCameraState.cameras.set(cameras)

  const xrSessionChangedQueue = createActionQueue(XRAction.sessionChanged.matches)

  const execute = () => {
    const xrState = getState(XRState)
    const xrFrame = Engine.instance.xrFrame

    for (const action of xrSessionChangedQueue()) {
      if (!action.active) {
        _currentDepthNear = null
        _currentDepthFar = null
      }
    }

    /** get viewer pose relative to the local floor */
    const referenceSpace = xrState.originReferenceSpace.value
    const viewerPose = referenceSpace && xrFrame?.getViewerPose(referenceSpace)
    xrState.viewerPose.set(viewerPose ?? null)

    if (!xrFrame) return
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
