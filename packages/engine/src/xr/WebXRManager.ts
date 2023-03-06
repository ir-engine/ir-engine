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
  WebGLMultiviewRenderTarget,
  WebGLRenderer,
  WebGLRenderTarget,
  WebGLRenderTargetOptions
} from 'three'

import { defineState, getState } from '@etherealengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { XRState } from './XRState'

// augment PerspectiveCamera
declare module 'three/src/cameras/PerspectiveCamera' {
  interface PerspectiveCamera {
    /**
     * viewport used for XR rendering
     */
    viewport: Vector4
  }
}

declare module 'three/src/renderers/WebGLRenderer' {
  interface WebGLRenderer {
    animation: WebGLAnimation
  }
}

declare module 'three' {
  class WebGLMultiviewRenderTarget extends WebGLRenderTarget {
    constructor(width: number, height: number, numViews: number, options: WebGLRenderTargetOptions)
    numViews: number
    static isWebGLMultiviewRenderTarget: true
  }
}

declare global {
  interface WebGLRenderingContext {
    DEPTH24_STENCIL8: number
    DEPTH_COMPONENT24: number
    RGBA8: number
  }

  interface XRSession {
    interactionMode: 'screen-space' | 'world-space'
  }
}

export const XRRendererState = defineState({
  name: 'XRRendererState',
  initial: {
    glBinding: null as XRWebGLBinding | null,
    glProjLayer: null as XRProjectionLayer | null,
    glBaseLayer: null as XRWebGLLayer | null,
    xrFrame: null as XRFrame | null,
    initialRenderTarget: null as WebGLRenderTarget | null,
    newRenderTarget: null as WebGLRenderTarget | null
  }
})

export function createWebXRManager() {
  const xrState = getState(XRState)
  const xrRendererState = getState(XRRendererState)

  const scope = function () {}

  scope.cameraAutoUpdate = false
  scope.enabled = false
  scope.useMultiview = true

  scope.isPresenting = false
  scope.isMultiview = false

  function onSessionEnd() {
    xrState.session.value!.removeEventListener('end', onSessionEnd)

    // restore framebuffer/rendering state

    EngineRenderer.instance.renderer.setRenderTarget(xrRendererState.initialRenderTarget.value)

    xrRendererState.glBaseLayer.set(null)
    xrRendererState.glProjLayer.set(null)
    xrRendererState.glBinding.set(null)
    xrRendererState.newRenderTarget.set(null)

    EngineRenderer.instance.renderer.animation.start()
    animation.stop()

    scope.isPresenting = false
  }

  /** this is needed by WebGLBackground */
  scope.getSession = function () {
    return xrState.session.value
  }

  scope.setSession = async function (session: XRSession, framebufferScaleFactor = 1) {
    if (session !== null) {
      const renderer = EngineRenderer.instance.renderer
      xrRendererState.initialRenderTarget.set(renderer.getRenderTarget())

      session.addEventListener('end', onSessionEnd)

      const gl = renderer.getContext() as WebGLRenderingContext
      const attributes = gl.getContextAttributes()!
      if (attributes.xrCompatible !== true) {
        await gl.makeXRCompatible()
      }

      let newRenderTarget = null as WebGLRenderTarget | null

      if (session.renderState.layers === undefined || renderer.capabilities.isWebGL2 === false) {
        const layerInit = {
          antialias: session.renderState.layers === undefined ? attributes.antialias : true,
          alpha: attributes.alpha,
          depth: attributes.depth,
          stencil: attributes.stencil,
          framebufferScaleFactor: framebufferScaleFactor
        }

        const glBaseLayer = new XRWebGLLayer(session, gl, layerInit)
        xrRendererState.glBaseLayer.set(glBaseLayer)

        session.updateRenderState({ baseLayer: glBaseLayer })

        newRenderTarget = new WebGLRenderTarget(glBaseLayer.framebufferWidth, glBaseLayer.framebufferHeight, {
          format: RGBAFormat,
          type: UnsignedByteType,
          encoding: renderer.outputEncoding,
          stencilBuffer: attributes.stencil
        })
      } else {
        let depthFormat: number | undefined
        let depthType: number | undefined
        let glDepthFormat: number | undefined

        if (attributes.depth) {
          glDepthFormat = attributes.stencil ? gl.DEPTH24_STENCIL8 : gl.DEPTH_COMPONENT24
          depthFormat = attributes.stencil ? DepthStencilFormat : DepthFormat
          depthType = attributes.stencil ? UnsignedInt248Type : UnsignedIntType
        }

        // @ts-ignore
        const extensions = renderer.extensions
        scope.isMultiview = scope.useMultiview && extensions.has('OCULUS_multiview')

        const projectionlayerInit = {
          colorFormat: gl.RGBA8,
          depthFormat: glDepthFormat,
          scaleFactor: framebufferScaleFactor,
          textureType: (scope.isMultiview ? 'texture-array' : 'texture') as XRTextureType
        }

        const glBinding = new XRWebGLBinding(session, gl)
        xrRendererState.glBinding.set(glBinding)

        const glProjLayer = glBinding.createProjectionLayer(projectionlayerInit)
        xrRendererState.glProjLayer.set(glProjLayer)

        session.updateRenderState({ layers: [glProjLayer] })

        const rtOptions = {
          format: RGBAFormat,
          type: UnsignedByteType,
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
            // @ts-ignore	- DepthTexture typings are missing last constructor argument
            depthFormat
          ),
          stencilBuffer: attributes.stencil,
          encoding: renderer.outputEncoding,
          samples: attributes.antialias ? 4 : 0
        }

        if (scope.isMultiview) {
          const extension = extensions.get('OCULUS_multiview')
          this.maxNumViews = gl.getParameter(extension.MAX_VIEWS_OVR)
          newRenderTarget = new WebGLMultiviewRenderTarget(
            glProjLayer.textureWidth,
            glProjLayer.textureHeight,
            2,
            rtOptions
          )
        } else {
          newRenderTarget = new WebGLRenderTarget(glProjLayer.textureWidth, glProjLayer.textureHeight, rtOptions)
        }
        const renderTargetProperties = renderer.properties.get(newRenderTarget)
        renderTargetProperties.__ignoreDepthValues = glProjLayer.ignoreDepthValues
      }

      // @ts-ignore
      newRenderTarget.isXRRenderTarget = true // TODO Remove scope when possible, see #23278
      xrRendererState.newRenderTarget.set(newRenderTarget)

      // Set foveation to maximum.
      scope.setFoveation(1.0)

      animation.setContext(session)
      renderer.animation.stop()
      animation.start()

      scope.isPresenting = true
    }
  }

  scope.updateCamera = function () {}

  scope.getCamera = function () {
    return Engine.instance.currentWorld.camera
  }

  scope.getFoveation = function () {
    const glBaseLayer = xrRendererState.glBaseLayer.value
    const glProjLayer = xrRendererState.glProjLayer.value

    if (glProjLayer !== null) {
      return glProjLayer.fixedFoveation
    }

    if (glBaseLayer !== null) {
      return glBaseLayer.fixedFoveation
    }

    return undefined
  }

  /** @todo put foveation in state and make a reactor to update it */
  scope.setFoveation = function (foveation) {
    const glBaseLayer = xrRendererState.glBaseLayer.value
    const glProjLayer = xrRendererState.glProjLayer.value

    // 0 = no foveation = full resolution
    // 1 = maximum foveation = the edges render at lower resolution

    if (glProjLayer !== null) {
      glProjLayer.fixedFoveation = foveation
    }

    if (glBaseLayer !== null && glBaseLayer.fixedFoveation !== undefined) {
      glBaseLayer.fixedFoveation = foveation
    }
  }

  // Animation Loop

  let onAnimationFrameCallback = null as typeof onAnimationFrame | null

  function onAnimationFrame(time: number, frame: XRFrame) {
    if (onAnimationFrameCallback) onAnimationFrameCallback(time, frame)
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
export type WebGLAnimation = ReturnType<typeof createWebGLAnimation>
