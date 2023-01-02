import {
  ArrayCamera,
  DepthFormat,
  DepthStencilFormat,
  DepthTexture,
  PerspectiveCamera,
  RGBAFormat,
  UnsignedByteType,
  UnsignedInt248Type,
  UnsignedIntType,
  Vector3,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'

// augment PerspectiveCamera
declare module 'three/src/cameras/PerspectiveCamera' {
  interface PerspectiveCamera {
    /**
     * viewport used for XR rendering
     */
    viewport: Vector4
  }
}

// augment WebGLRenderingContext
declare global {
  interface WebGLRenderingContext {
    DEPTH24_STENCIL8: number
    DEPTH_COMPONENT24: number
    RGBA8: number
  }
}

export function createWebXRManager(
  renderer: WebGLRenderer,
  gl: WebGLRenderingContext,
  extensions: Map<string, any>,
  useMultiview: boolean
) {
  const scope = function () {}

  let session = null as XRSession | null
  let framebufferScaleFactor = 1.0

  let referenceSpace = null as XRReferenceSpace | null
  let referenceSpaceType = 'local-floor' as XRReferenceSpaceType
  let customReferenceSpace = null as XRReferenceSpace | null

  let pose: XRViewerPose | undefined
  let glBinding = null as XRWebGLBinding | null
  let glProjLayer = null as XRProjectionLayer | null
  let glBaseLayer = null as XRWebGLLayer | null
  let xrFrame = null as XRFrame | null
  const attributes = gl.getContextAttributes()
  let initialRenderTarget = null as WebGLRenderTarget | null
  let newRenderTarget = null as WebGLRenderTarget | null

  const controllers = []
  const controllerInputSources = []

  const planes = new Set()
  const planesLastChangedTimes = new Map()

  //

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

  let _currentDepthNear = null as number | null
  let _currentDepthFar = null as number | null

  //

  scope.cameraAutoUpdate = true
  scope.enabled = false

  scope.isPresenting = false
  scope.isMultiview = false

  function onSessionEnd() {
    session!.removeEventListener('end', onSessionEnd)

    _currentDepthNear = null
    _currentDepthFar = null

    // restore framebuffer/rendering state

    renderer.setRenderTarget(initialRenderTarget)

    glBaseLayer = null
    glProjLayer = null
    glBinding = null
    session = null
    newRenderTarget = null

    //

    animation.stop()

    scope.isPresenting = false
  }

  scope.setFramebufferScaleFactor = function (value) {
    framebufferScaleFactor = value

    if (scope.isPresenting === true) {
      console.warn('THREE.WebXRManager: Cannot change framebuffer scale while presenting.')
    }
  }

  scope.setReferenceSpaceType = function (value) {
    referenceSpaceType = value

    if (scope.isPresenting === true) {
      console.warn('THREE.WebXRManager: Cannot change reference space type while presenting.')
    }
  }

  scope.getReferenceSpace = function () {
    return customReferenceSpace || referenceSpace
  }

  scope.setReferenceSpace = function (space) {
    customReferenceSpace = space
  }

  scope.getBaseLayer = function () {
    return glProjLayer !== null ? glProjLayer : glBaseLayer
  }

  scope.getBinding = function () {
    return glBinding
  }

  scope.getFrame = function () {
    return xrFrame
  }

  scope.getSession = function () {
    return session
  }

  scope.setSession = async function (value) {
    session = value

    if (session !== null) {
      initialRenderTarget = renderer.getRenderTarget()

      session.addEventListener('end', onSessionEnd)

      if (attributes?.xrCompatible !== true) {
        await gl.makeXRCompatible()
      }

      if (session.renderState.layers === undefined || renderer.capabilities.isWebGL2 === false) {
        const layerInit = {
          antialias: session.renderState.layers === undefined ? attributes?.antialias : true,
          alpha: attributes?.alpha,
          depth: attributes?.depth,
          stencil: attributes?.stencil,
          framebufferScaleFactor: framebufferScaleFactor
        }

        glBaseLayer = new XRWebGLLayer(session, gl, layerInit)

        session.updateRenderState({ baseLayer: glBaseLayer })

        newRenderTarget = new WebGLRenderTarget(glBaseLayer.framebufferWidth, glBaseLayer.framebufferHeight, {
          format: RGBAFormat,
          type: UnsignedByteType,
          encoding: renderer.outputEncoding,
          stencilBuffer: attributes?.stencil
        })
      } else {
        let depthFormat: number | undefined
        let depthType: number | undefined
        let glDepthFormat: number | undefined

        if (attributes?.depth) {
          glDepthFormat = attributes.stencil ? gl.DEPTH24_STENCIL8 : gl.DEPTH_COMPONENT24
          depthFormat = attributes.stencil ? DepthStencilFormat : DepthFormat
          depthType = attributes.stencil ? UnsignedInt248Type : UnsignedIntType
        }

        scope.isMultiview = useMultiview && extensions.has('OCULUS_multiview')

        const projectionlayerInit = {
          colorFormat: gl.RGBA8,
          depthFormat: glDepthFormat,
          scaleFactor: framebufferScaleFactor
        }

        glBinding = new XRWebGLBinding(session, gl)

        glProjLayer = glBinding.createProjectionLayer(projectionlayerInit)

        session.updateRenderState({ layers: [glProjLayer] })

        newRenderTarget = new WebGLRenderTarget(glProjLayer.textureWidth, glProjLayer.textureHeight, {
          format: RGBAFormat,
          type: UnsignedByteType,
          // @ts-ignore	- DepthTexture typings are missing last constructor argument
          depthTexture: new DepthTexture(
            glProjLayer.textureWidth,
            glProjLayer.textureHeight,
            depthType,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            depthFormat
          ),
          stencilBuffer: attributes?.stencil,
          encoding: renderer.outputEncoding,
          samples: attributes?.antialias ? 4 : 0
        })

        const renderTargetProperties = renderer.properties.get(newRenderTarget)
        renderTargetProperties.__ignoreDepthValues = glProjLayer.ignoreDepthValues
      }

      // @ts-ignore
      newRenderTarget.isXRRenderTarget = true // TODO Remove scope when possible, see #23278

      // Set foveation to maximum.
      scope.setFoveation(1.0)

      customReferenceSpace = null
      referenceSpace = await session.requestReferenceSpace(referenceSpaceType)

      animation.setContext(session)
      animation.start()

      scope.isPresenting = true
    }
  }

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
    pose = xrFrame!.getViewerPose(customReferenceSpace ?? referenceSpace!)

    if (pose) {
      const views = pose.views

      if (glBaseLayer !== null) {
        // @ts-ignore setRenderTargetFramebuffer is not in the type definition
        renderer.setRenderTargetFramebuffer(newRenderTarget, glBaseLayer.framebuffer)
        renderer.setRenderTarget(newRenderTarget)
      }

      let cameraVRNeedsUpdate = false

      // check if it's necessary to rebuild cameraVR's camera list

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

  scope.updateCamera = function (camera) {
    if (session === null) return

    updatePoseFromXRFrame()

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

  scope.getCamera = function () {
    return cameraVR
  }

  scope.getFoveation = function () {
    if (glProjLayer !== null) {
      return glProjLayer.fixedFoveation
    }

    if (glBaseLayer !== null) {
      return glBaseLayer.fixedFoveation
    }

    return undefined
  }

  scope.setFoveation = function (foveation) {
    // 0 = no foveation = full resolution
    // 1 = maximum foveation = the edges render at lower resolution

    if (glProjLayer !== null) {
      glProjLayer.fixedFoveation = foveation
    }

    if (glBaseLayer !== null && glBaseLayer.fixedFoveation !== undefined) {
      glBaseLayer.fixedFoveation = foveation
    }
  }

  scope.getPlanes = function () {
    return planes
  }

  // Animation Loop

  let onAnimationFrameCallback = null as typeof onAnimationFrame | null

  function onAnimationFrame(time: number, frame: XRFrame) {
    xrFrame = frame

    if (onAnimationFrameCallback) onAnimationFrameCallback(time, frame)

    xrFrame = null
  }

  const animation = createWebGLAnimation()

  animation.setAnimationLoop(onAnimationFrame)

  scope.setAnimationLoop = function (callback: typeof onAnimationFrame) {
    onAnimationFrameCallback = callback
  }

  return scope
}

function createWebGLAnimation() {
  let context = null as any
  let isAnimating = false
  let animationLoop = null as null | ((time: number, frame: XRFrame) => void)
  let requestId = null

  function onAnimationFrame(time, frame) {
    animationLoop!(time, frame)

    requestId = context.requestAnimationFrame(onAnimationFrame)
  }

  return {
    start: function () {
      if (isAnimating === true) return
      if (animationLoop === null) return

      requestId = context.requestAnimationFrame(onAnimationFrame)

      isAnimating = true
    },

    stop: function () {
      context.cancelAnimationFrame(requestId)

      isAnimating = false
    },

    setAnimationLoop: function (callback) {
      animationLoop = callback
    },

    setContext: function (value) {
      context = value
    }
  }
}

export type WebXRManager = ReturnType<typeof createWebXRManager>
