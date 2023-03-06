import { ArrayCamera, PerspectiveCamera, Vector2, Vector3, Vector4 } from 'three'

import { createActionQueue, getState } from '@etherealengine/hyperflux'

import { CameraComponent } from '../camera/components/CameraComponent'
import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRRendererState } from './WebXRManager'
import { ReferenceSpace, XRAction, XRState } from './XRState'

const cameraLPos = new Vector3()
const cameraRPos = new Vector3()

const cameraL = new PerspectiveCamera()
cameraL.layers.enable(1)
cameraL.viewport = new Vector4()
cameraL.matrixAutoUpdate = false
cameraL.matrixWorldAutoUpdate = false

const cameraR = new PerspectiveCamera()
cameraR.layers.enable(2)
cameraR.viewport = new Vector4()
cameraR.matrixAutoUpdate = false
cameraR.matrixWorldAutoUpdate = false

const cameraPool = [cameraL, cameraR]

/**
 * Assumes 2 cameras that are parallel and share an X-axis, and that
 * the cameras' projection and world matrices have already been set.
 * And that near and far planes are identical for both cameras.
 * Visualization of scope technique: https://computergraphics.stackexchange.com/a/4765
 */
function updateProjectionFromCameraArrayUnion(camera: ArrayCamera) {
  if (camera.cameras.length !== 2) {
    // assume single camera setup
    camera.projectionMatrix.copy(cameraL.projectionMatrix)
    return
  }

  // TODO: verify this is actually an HMD setup, not projection mapping or something
  // update projection matrix for proper view frustum culling

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
  // cameraL.matrixWorld.decompose(camera.position, camera.quaternion, camera.scale)
  // camera.translateX(xOffset)
  // camera.translateZ(zOffset)
  // camera.matrixWorld.compose(camera.position, camera.quaternion, camera.scale)
  // camera.matrixWorldInverse.copy(camera.matrixWorld).invert()

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

function updateCameraFromXRViewerPose() {
  const world = Engine.instance.currentWorld
  const camera = getComponent(world.cameraEntity, CameraComponent)
  const originTransform = getComponent(world.originEntity, TransformComponent)
  const cameraTransform = getComponent(world.cameraEntity, TransformComponent)
  const renderer = EngineRenderer.instance.renderer
  const xrState = getState(XRState)
  const pose = xrState.viewerPose.value

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

    cameraTransform.position.copy(pose.transform.position as any).multiplyScalar(1 / xrState.sceneScale.value)
    cameraTransform.rotation.copy(pose.transform.orientation as any)
    cameraTransform.matrix
      .compose(cameraTransform.position, cameraTransform.rotation, cameraTransform.scale)
      .premultiply(originTransform.matrix)
      .decompose(cameraTransform.position, cameraTransform.rotation, cameraTransform.scale)
    cameraTransform.matrixInverse.copy(cameraTransform.matrix).invert()

    // check if it's necessary to rebuild camera list
    let cameraListNeedsUpdate = false
    if (views.length !== camera.cameras.length) {
      camera.cameras.length = 0
      cameraListNeedsUpdate = true
    }

    for (let i = 0; i < views.length; i++) {
      const view = views[i]

      let viewport: XRViewport | null = null

      if (glBaseLayer !== null) {
        viewport = glBaseLayer.getViewport(view)!
      } else if (glBinding) {
        const glSubImage = glBinding.getViewSubImage(glProjLayer!, view)
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

      let viewCamera = cameraPool[i]

      if (viewCamera === undefined) {
        viewCamera = new PerspectiveCamera()
        viewCamera.layers.enable(i)
        viewCamera.viewport = new Vector4()
        cameraPool[i] = viewCamera
        viewCamera.matrixAutoUpdate = false
        viewCamera.matrixWorldAutoUpdate = false
      }

      viewCamera.position.copy(view.transform.position as any).multiplyScalar(1 / xrState.sceneScale.value)
      viewCamera.quaternion.copy(view.transform.orientation as any)
      viewCamera.matrixWorld
        .compose(viewCamera.position, viewCamera.quaternion, viewCamera.scale)
        .premultiply(originTransform.matrix)
        .decompose(viewCamera.position, viewCamera.quaternion, viewCamera.scale)
      viewCamera.matrixWorldInverse.copy(viewCamera.matrixWorld).invert()
      viewCamera.projectionMatrix.fromArray(view.projectionMatrix)
      if (viewport) viewCamera.viewport.set(viewport.x, viewport.y, viewport.width, viewport.height)

      if (cameraListNeedsUpdate === true) {
        camera.cameras.push(viewCamera)
      }
    }
  }
}

let _currentDepthNear = null as number | null
let _currentDepthFar = null as number | null
const _vec = new Vector2()

export function updateXRCamera() {
  const renderer = EngineRenderer.instance.renderer

  const world = Engine.instance.currentWorld
  const camera = world.camera
  const xrState = getState(XRState)
  const session = xrState.session.value

  if (session === null) {
    camera.cameras = [cameraL]
    cameraL.copy(camera, false)
    const size = renderer.getDrawingBufferSize(_vec)
    cameraL.viewport.x = 0
    cameraL.viewport.y = 0
    cameraL.viewport.z = size.width
    cameraL.viewport.w = size.height
    return
  }

  updateCameraFromXRViewerPose()

  cameraR.near = cameraL.near = camera.near
  cameraR.far = cameraL.far = camera.far

  if (_currentDepthNear !== camera.near || _currentDepthFar !== camera.far) {
    // Note that the new renderState won't apply until the next frame. See #18320

    session.updateRenderState({
      depthNear: camera.near,
      depthFar: camera.far
    })

    _currentDepthNear = camera.near
    _currentDepthFar = camera.far
  }

  updateProjectionFromCameraArrayUnion(camera)
}

export default async function XRCameraSystem(world: World) {
  const xrSessionChangedQueue = createActionQueue(XRAction.sessionChanged.matches)
  const xrState = getState(XRState)

  const execute = () => {
    for (const action of xrSessionChangedQueue()) {
      if (!action.active) {
        _currentDepthNear = null
        _currentDepthFar = null
      }
    }

    xrState.viewerPose.set(
      ReferenceSpace.localFloor && Engine.instance.xrFrame?.getViewerPose(ReferenceSpace.localFloor)
    )
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
