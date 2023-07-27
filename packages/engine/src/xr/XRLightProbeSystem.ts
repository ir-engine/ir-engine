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

import { useEffect } from 'react'
import { CubeTexture, DirectionalLight, LightProbe, Vector3, WebGLCubeRenderTarget } from 'three'

import { defineState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { RendererState } from '../renderer/RendererState'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { XRState } from './XRState'

type XRPreferredReflectionFormat = 'srgba8' | 'rgba16f'
declare global {
  interface XRSession {
    preferredReflectionFormat: XRPreferredReflectionFormat
    requestLightProbe: (options: { reflectionFormat?: XRPreferredReflectionFormat }) => Promise<XRLightProbe>
  }
  interface XRFrame {
    getLightEstimate?: (probe: XRLightProbe) => XRLightEstimate
  }
  interface XRWebGLBinding {
    getReflectionCubeMap?: (probe: XRLightProbe) => WebGLTexture
  }
  interface XRLightProbe {
    probeSpace: XRSpace
  }
  interface XRLightEstimate {
    primaryLightDirection: DOMPointReadOnly
    primaryLightIntensity: DOMPointReadOnly // { x: r, y: g, z: b }
    sphericalHarmonicsCoefficients: Float32Array
  }
}
export const XRLightProbeState = defineState({
  name: 'ee.xr.LightProbe',
  initial: () => ({
    isEstimatingLight: false,
    lightProbe: new LightProbe(),
    probe: null as XRLightProbe | null,
    directionalLight: new DirectionalLight(),
    environment: null as CubeTexture | null,
    xrWebGLBinding: null as XRWebGLBinding | null
  })
})

const updateReflection = () => {
  const xrLightProbeState = getState(XRLightProbeState)

  if (!xrLightProbeState.environment || !xrLightProbeState.xrWebGLBinding || !xrLightProbeState.probe) return

  const textureProperties = EngineRenderer.instance.renderer.properties.get(xrLightProbeState.environment)

  if (textureProperties) {
    const cubeMap = xrLightProbeState.xrWebGLBinding!.getReflectionCubeMap?.(xrLightProbeState.probe)
    if (cubeMap) {
      textureProperties.__webglTexture = cubeMap
      xrLightProbeState.environment.needsPMREMUpdate = true
    }
  }
}

/**
 * https://github.com/mrdoob/three.js/blob/master/examples/webxr_ar_lighting.html
 */
const execute = () => {
  const xrLightProbeState = getState(XRLightProbeState)

  const xrFrame = Engine.instance.xrFrame
  if (!xrFrame) return

  if (!xrLightProbeState.probe) return

  if (!('getLightEstimate' in xrFrame)) return

  const lightEstimate = xrFrame.getLightEstimate!(xrLightProbeState.probe)
  if (lightEstimate) {
    if (!xrLightProbeState.isEstimatingLight) getMutableState(XRLightProbeState).isEstimatingLight.set(true)

    // We can copy the estimate's spherical harmonics array directly into the light probe.
    xrLightProbeState.lightProbe.sh.fromArray(lightEstimate.sphericalHarmonicsCoefficients)
    xrLightProbeState.lightProbe.intensity = 1.0

    // For the directional light we have to normalize the color and set the scalar as the
    // intensity, since WebXR can return color values that exceed 1.0.
    const intensityScalar = Math.max(
      1.0,
      Math.max(
        lightEstimate.primaryLightIntensity.x,
        Math.max(lightEstimate.primaryLightIntensity.y, lightEstimate.primaryLightIntensity.z)
      )
    )

    xrLightProbeState.directionalLight.color.setRGB(
      lightEstimate.primaryLightIntensity.x / intensityScalar,
      lightEstimate.primaryLightIntensity.y / intensityScalar,
      lightEstimate.primaryLightIntensity.z / intensityScalar
    )
    xrLightProbeState.directionalLight.intensity = intensityScalar
    xrLightProbeState.directionalLight.position.copy(lightEstimate.primaryLightDirection as any as Vector3)
  }

  if (getState(RendererState).csm && xrLightProbeState.isEstimatingLight) {
    // maybe use -1 * pos
    xrLightProbeState.directionalLight.getWorldDirection(getState(RendererState).csm!.lightDirection)
  }
}

const reactor = () => {
  const xrState = useHookstate(getMutableState(XRState))
  const xrLightProbeState = useHookstate(getMutableState(XRLightProbeState))

  useEffect(() => {
    const xrLightProbeState = getState(XRLightProbeState)
    xrLightProbeState.lightProbe.intensity = 0
    xrLightProbeState.directionalLight.intensity = 0
    xrLightProbeState.directionalLight.shadow.bias = -0.000001
    xrLightProbeState.directionalLight.shadow.radius = 1
    xrLightProbeState.directionalLight.shadow.camera.far = 2000
    xrLightProbeState.directionalLight.castShadow = true
  }, [])

  useEffect(() => {
    const session = xrState.session.value
    if (!session) return

    const lightingSupported = 'requestLightProbe' in session
    if (!lightingSupported) return

    const environmentEstimation = true

    session
      .requestLightProbe({
        reflectionFormat: session.preferredReflectionFormat
      })
      .then((probe: XRLightProbe) => {
        xrLightProbeState.probe.set(probe)
      })
      .catch((err) => {
        console.warn('Tried to initialize light probe but failed with error', err)
      })

    // If the XRWebGLBinding class is available then we can also query an
    // estimated reflection cube map.
    if (environmentEstimation && 'XRWebGLBinding' in window) {
      // This is the simplest way I know of to initialize a WebGL cubemap in Three.
      const cubeRenderTarget = new WebGLCubeRenderTarget(16)
      xrLightProbeState.environment.set(cubeRenderTarget.texture)

      const gl = EngineRenderer.instance.renderer.getContext()

      // Ensure that we have any extensions needed to use the preferred cube map format.
      switch (session.preferredReflectionFormat) {
        case 'srgba8':
          gl.getExtension('EXT_sRGB')
          break

        case 'rgba16f':
          gl.getExtension('OES_texture_half_float')
          break
      }

      xrLightProbeState.xrWebGLBinding.set(new XRWebGLBinding(session, gl))

      xrLightProbeState.lightProbe.value.addEventListener('reflectionchange', () => {
        updateReflection()
      })
    }

    return () => {
      xrLightProbeState.isEstimatingLight.set(false)
    }
  }, [xrState.session])

  useEffect(() => {
    if (!xrLightProbeState.isEstimatingLight.value) return

    if (xrState.sessionMode.value !== 'immersive-ar') return

    let previousEnvironment

    // The estimated lighting also provides an environment cubemap, which we can apply here.
    if (xrLightProbeState.environment.value) {
      previousEnvironment = Engine.instance.scene.environment
      Engine.instance.scene.environment = xrLightProbeState.environment.value
      Engine.instance.scene.add(xrLightProbeState.directionalLight.value)
    }

    return () => {
      Engine.instance.scene.environment = previousEnvironment
      Engine.instance.scene.remove(xrLightProbeState.directionalLight.value)
    }
  }, [xrLightProbeState.isEstimatingLight])

  return null
}

export const XRLightProbeSystem = defineSystem({
  uuid: 'ee.engine.XRLightProbeSystem',
  execute,
  reactor
})
