/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
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
  WebGLRenderer,
  WebGLRenderTarget,
  WebGLRenderTargetOptions
} from 'three'

import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineState, getMutableState, getState, NO_PROXY } from '@ir-engine/hyperflux'

import { createAnimationLoop, ECSState } from '@ir-engine/ecs'
import { CameraComponent } from '../camera/components/CameraComponent'
import { EngineState } from '../EngineState'
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

/**
 * @description Member function of the {@link WebXRManager} class-like object
 * */
function getSession() {
  return getState(XRState).session
}

/**
 * @description Factory function that creates the `onSessionEnd` member function of the {@link WebXRManager} class-like object
 * */
function createFunctionOnSessionEnd(renderer: WebGLRenderer, scope) {
  const onSessionEnd = () => {
    const xrState = getState(XRState)
    const xrRendererState = getMutableState(XRRendererState)
    const ecsState = getState(ECSState)
    const { animation } = ecsState.timer

    xrState.session!.removeEventListener('end', onSessionEnd)

    // restore framebuffer/rendering state

    renderer.setRenderTarget(xrRendererState.initialRenderTarget.value as WebGLRenderTarget)

    xrRendererState.glBaseLayer.set(null)
    xrRendererState.glProjLayer.set(null)
    xrRendererState.glBinding.set(null)
    xrRendererState.newRenderTarget.set(null)

    animation.setContext(globalThis)
    animation.stop()
    animation.start()

    scope.isPresenting = false
  }
  return onSessionEnd
}

/**
 * @description Member function of the {@link WebXRManager} class-like object
 * */
function getEnvironmentBlendMode() {
  const xrState = getState(XRState)
  if (xrState.session === null) return undefined
  return xrState.session.environmentBlendMode
}

/**
 * @description Member function of the {@link WebXRManager} class-like object
 * */
function getCamera() {
  return getComponent(getState(EngineState).viewerEntity, CameraComponent)
}

/**
 * @description Member function of the {@link WebXRManager} class-like object
 * */
function getFoveation() {
  const xrRendererState = getMutableState(XRRendererState)
  const glBaseLayer = xrRendererState.glBaseLayer.value
  const glProjLayer = xrRendererState.glProjLayer.value

  if (glProjLayer !== null) return glProjLayer.fixedFoveation
  if (glBaseLayer !== null) return glBaseLayer.fixedFoveation

  return undefined
}

/**
 * @description Member function of the {@link WebXRManager} class-like object
 * */
function setFoveation(foveation: number) {
  const xrRendererState = getMutableState(XRRendererState)
  const glBaseLayer = xrRendererState.glBaseLayer.get(NO_PROXY) as XRWebGLLayer
  const glProjLayer = xrRendererState.glProjLayer.get(NO_PROXY) as XRProjectionLayer

  // 0 = no foveation = full resolution
  // 1 = maximum foveation = the edges render at lower resolution

  if (glProjLayer !== null) {
    glProjLayer.fixedFoveation = foveation
  }

  if (glBaseLayer !== null && glBaseLayer.fixedFoveation !== undefined) {
    glBaseLayer.fixedFoveation = foveation
  }
}

/**
 * @description Creates a WebGL render target compatible with the {@link WebXRManager} (legacy mode/support)
 * @note Used when the {@link XRSession} has no `renderState.layers` or when WebGL2 is not supported.
 * */
function createRenderTargetLegacy(
  session: XRSession,
  framebufferScaleFactor: number,
  gl: WebGLRenderingContext,
  attributes: WebGLContextAttributes,
  renderer: WebGLRenderer,
  _: WebXRManager
): WebGLRenderTarget {
  const xrRendererState = getMutableState(XRRendererState)
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

  return new WebGLRenderTarget(glBaseLayer.framebufferWidth, glBaseLayer.framebufferHeight, {
    format: RGBAFormat,
    type: UnsignedByteType,
    colorSpace: renderer.outputColorSpace,
    stencilBuffer: attributes.stencil
  })
}

/**
 * @description Creates a WebGL2 render target compatible with the {@link WebXRManager}
 * @note Requires WebGL2 support and a XRSession with valid renderState.layers.
 * */
function createRenderTarget(
  session: XRSession,
  framebufferScaleFactor: number,
  gl: WebGLRenderingContext,
  attributes: WebGLContextAttributes,
  renderer: WebGLRenderer,
  manager: WebXRManager
): WebGLRenderTarget {
  let result = null as WebGLRenderTarget | null
  let depthFormat: number | undefined
  let depthType: TextureDataType | undefined
  let glDepthFormat: number | undefined

  const xrRendererState = getMutableState(XRRendererState)

  if (attributes.depth) {
    glDepthFormat = attributes.stencil ? gl.DEPTH24_STENCIL8 : gl.DEPTH_COMPONENT24
    depthFormat = attributes.stencil ? DepthStencilFormat : DepthFormat
    depthType = attributes.stencil ? UnsignedInt248Type : UnsignedIntType
  }

  // @ts-ignore
  const extensions = renderer.extensions
  manager.isMultiview = manager.useMultiview && extensions.has('OCULUS_multiview')

  const projectionlayerInit = {
    colorFormat: gl.RGBA8,
    depthFormat: glDepthFormat,
    scaleFactor: framebufferScaleFactor,
    textureType: (manager.isMultiview ? 'texture-array' : 'texture') as XRTextureType
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
      // @ts-expect-error	- DepthTexture typings are missing last constructor argument
      depthFormat
    ),
    stencilBuffer: attributes.stencil,
    colorSpace: renderer.outputColorSpace,
    samples: attributes.antialias ? 4 : 0
  }

  if (manager.isMultiview) {
    const extension = extensions.get('OCULUS_multiview')
    this.maxNumViews = gl.getParameter(extension.MAX_VIEWS_OVR)
    result = new WebGLMultiviewRenderTarget(glProjLayer.textureWidth, glProjLayer.textureHeight, 2, rtOptions)
  } else {
    result = new WebGLRenderTarget(glProjLayer.textureWidth, glProjLayer.textureHeight, rtOptions)
  }
  const renderTargetProperties = renderer.properties.get(result)
  renderTargetProperties.__ignoreDepthValues = glProjLayer.ignoreDepthValues

  return result
}

/**
 * @description Factory function that creates the `setSession` member function of the {@link WebXRManager} class-like object
 * */
function createFunctionSetSession(renderer: WebGLRenderer, manager: WebXRManager) {
  return async function (session: XRSession, framebufferScaleFactor = 1) {
    if (session === null) return
    const ecsState = getState(ECSState)
    const { animation } = ecsState.timer
    const xrRendererState = getMutableState(XRRendererState)

    xrRendererState.initialRenderTarget.set(renderer.getRenderTarget())

    session.addEventListener('end', manager.onSessionEnd)

    // wrap in try catch to avoid errors when calling updateTargetFrameRate on unsupported devices
    try {
      if (typeof session.updateTargetFrameRate === 'function') session.updateTargetFrameRate(72)
    } catch (e) {
      console.warn(e)
    }

    const gl = renderer.getContext() as WebGLRenderingContext
    const attributes = gl.getContextAttributes()!
    if (attributes.xrCompatible !== true) {
      await gl.makeXRCompatible()
    }

    const newRenderTarget =
      session.renderState.layers === undefined || renderer.capabilities.isWebGL2 === false
        ? createRenderTargetLegacy(session, framebufferScaleFactor, gl, attributes, renderer, manager)
        : createRenderTarget(session, framebufferScaleFactor, gl, attributes, renderer, manager)

    // @ts-expect-error @todo Remove scope when possible, see #23278
    newRenderTarget.isXRRenderTarget = true
    xrRendererState.newRenderTarget.set(newRenderTarget)

    // Set foveation to maximum.
    // scope.setFoveation(1.0)
    manager.setFoveation(0)

    animation.setContext(session)
    animation.stop()
    animation.start()

    manager.isPresenting = true
  }
}

/**
 * @description Factory function that creates a {@link WebXRManager} class-like object
 * */
export function createWebXRManager(renderer: WebGLRenderer) {
  const result = function () {}

  result.cameraAutoUpdate = false
  result.enabled = false
  result.useMultiview = true

  result.isPresenting = false
  result.isMultiview = false

  /** this is needed by WebGLBackground */
  result.getSession = getSession
  result.onSessionEnd = createFunctionOnSessionEnd(renderer, result)

  result.setSession = createFunctionSetSession(renderer, result)

  result.getEnvironmentBlendMode = getEnvironmentBlendMode

  result.updateCamera = function () {}
  result.getCamera = getCamera

  result.getFoveation = getFoveation

  /** @todo put foveation in state and make a reactor to update it */
  result.setFoveation = setFoveation

  result.setAnimationLoop = function () {}
  result.dispose = function () {}
  result.addEventListener = function (type: string, listener: EventListener) {}
  result.hasEventListener = function (type: string, listener: EventListener) {}
  result.removeEventListener = function (type: string, listener: EventListener) {}
  result.dispatchEvent = function (event: Event) {}

  return result
}

export type WebXRManager = ReturnType<typeof createWebXRManager>
export type WebGLAnimation = ReturnType<typeof createAnimationLoop>

export const WebXRManagerFunctions = {
  getSession,
  createFunctionOnSessionEnd,
  createFunctionSetSession,
  getEnvironmentBlendMode,
  getCamera,
  getFoveation,
  setFoveation,
  createRenderTargetLegacy,
  createRenderTarget
}
