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

import {
  DepthFormat,
  DepthStencilFormat,
  DepthTexture,
  RGBAFormat,
  TextureDataType,
  UnsignedByteType,
  UnsignedInt248Type,
  UnsignedIntType,
  Vector4,
  WebGLMultiviewRenderTarget,
  WebGLRenderTarget,
  WebGLRenderTargetOptions
} from 'three'

import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'

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

  interface XRProjectionLayer {
    quality: 'default' | 'text-optimized' | 'graphics-optimized'
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
  const xrRendererState = getMutableState(XRRendererState)

  const scope = function () {}

  scope.cameraAutoUpdate = false
  scope.enabled = false
  scope.useMultiview = true

  scope.isPresenting = false
  scope.isMultiview = false

  function onSessionEnd() {
    xrState.session!.removeEventListener('end', onSessionEnd)

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
    return xrState.session
  }

  scope.setSession = async function (session: XRSession, framebufferScaleFactor = 1) {
    if (session !== null) {
      const renderer = EngineRenderer.instance.renderer
      xrRendererState.initialRenderTarget.set(renderer.getRenderTarget())

      session.addEventListener('end', onSessionEnd)

      // wrap in try catch to avoid errors when calling updateTargetFrameRate on unsupported devices
      try {
        if ('updateTargetFrameRate' in session) session.updateTargetFrameRate(72)
      } catch (e) {
        console.warn(e)
      }

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
          colorSpace: renderer.outputColorSpace,
          stencilBuffer: attributes.stencil
        })
      } else {
        let depthFormat: number | undefined
        let depthType: TextureDataType | undefined
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
          // quality: "graphics-optimized" /** @todo - this does not work yet, must be set directly on the layer */
        }

        const glBinding = new XRWebGLBinding(session, gl)
        xrRendererState.glBinding.set(glBinding)

        const glProjLayer = glBinding.createProjectionLayer(projectionlayerInit)
        glProjLayer.quality = 'graphics-optimized'
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
          colorSpace: renderer.outputColorSpace,
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
      // scope.setFoveation(1.0)
      scope.setFoveation(0)

      animation.setContext(session)
      renderer.animation.stop()
      animation.start()

      scope.isPresenting = true
    }
  }

  scope.getEnvironmentBlendMode = function () {
    if (xrState.session !== null) {
      return xrState.session.environmentBlendMode
    }
  }

  scope.updateCamera = function () {}

  scope.getCamera = function () {
    return Engine.instance.camera
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
    requestId = context.requestAnimationFrame(onAnimationFrame)
    animationLoop!(time, frame)
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
