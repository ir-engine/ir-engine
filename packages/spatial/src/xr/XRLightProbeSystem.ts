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

import { useEffect } from 'react'
import { Color, CubeTexture, LightProbe, Vector3, WebGLCubeRenderTarget } from 'three'

import { Engine } from '@ir-engine/ecs'
import { getComponent, getMutableComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { createEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { defineState, getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'

import { Vector3_Zero } from '../common/constants/MathConstants'
import { RendererComponent } from '../renderer/WebGLRendererSystem'
import { addObjectToGroup } from '../renderer/components/GroupComponent'
import { setVisibleComponent } from '../renderer/components/VisibleComponent'
import { DirectionalLightComponent } from '../renderer/components/lights/DirectionalLightComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRState } from './XRState'
import { XRSystem } from './XRSystem'

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
    addEventListener: (type: 'reflectionchange', listener: () => void) => void
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
    directionalLightEntity: UndefinedEntity,
    environment: null as CubeTexture | null,
    xrWebGLBinding: null as XRWebGLBinding | null
  })
})

const updateReflection = () => {
  const xrLightProbeState = getState(XRLightProbeState)

  if (!xrLightProbeState.environment || !xrLightProbeState.xrWebGLBinding || !xrLightProbeState.probe) return

  const textureProperties = getComponent(Engine.instance.viewerEntity, RendererComponent).renderer!.properties.get(
    xrLightProbeState.environment
  )

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

  const xrFrame = getState(XRState).xrFrame
  if (!xrFrame) return

  if (!xrLightProbeState.probe) return

  if (!('getLightEstimate' in xrFrame)) return

  const lightEstimate = xrFrame.getLightEstimate?.(xrLightProbeState.probe)
  if (lightEstimate) {
    if (!xrLightProbeState.isEstimatingLight) getMutableState(XRLightProbeState).isEstimatingLight.set(true)
    if (!xrLightProbeState.directionalLightEntity) return

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

    const directionalLightState = getMutableComponent(
      xrLightProbeState.directionalLightEntity,
      DirectionalLightComponent
    )

    directionalLightState.color.set(
      new Color(
        lightEstimate.primaryLightIntensity.x / intensityScalar,
        lightEstimate.primaryLightIntensity.y / intensityScalar,
        lightEstimate.primaryLightIntensity.z / intensityScalar
      )
    )
    directionalLightState.intensity.set(intensityScalar)

    getComponent(xrLightProbeState.directionalLightEntity, TransformComponent).rotation.setFromUnitVectors(
      Vector3_Zero,
      lightEstimate.primaryLightDirection as any as Vector3
    )
  }
}

const reactor = () => {
  const xrState = useMutableState(XRState)
  const xrLightProbeState = useMutableState(XRLightProbeState)

  useEffect(() => {
    const xrLightProbeState = getState(XRLightProbeState)
    xrLightProbeState.lightProbe.intensity = 0
  }, [])

  useEffect(() => {
    const session = xrState.session.value
    if (!session) return

    const lightingSupported = 'requestLightProbe' in session
    if (!lightingSupported) return console.warn('No light probe available')

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

    return () => {
      xrLightProbeState.environment.set(null)
      xrLightProbeState.xrWebGLBinding.set(null)
      xrLightProbeState.isEstimatingLight.set(false)
      xrLightProbeState.probe.set(null)
    }
  }, [xrState.session])

  useEffect(() => {
    if (!xrLightProbeState.isEstimatingLight.value) return

    if (xrState.sessionMode.value !== 'immersive-ar') return

    const directionalLightEntity = createEntity()
    setComponent(directionalLightEntity, DirectionalLightComponent, {
      intensity: 0,
      shadowBias: -0.000001,
      shadowRadius: 1,
      cameraFar: 2000,
      castShadow: true
    })
    addObjectToGroup(directionalLightEntity, getState(XRLightProbeState).lightProbe)
    setVisibleComponent(directionalLightEntity, true)

    xrLightProbeState.directionalLightEntity.set(directionalLightEntity)

    return () => {
      xrLightProbeState.directionalLightEntity.set(UndefinedEntity)
    }
  }, [xrLightProbeState.isEstimatingLight])

  useEffect(() => {
    const session = getState(XRState).session
    const probe = xrLightProbeState.probe.value
    if (!probe || !session) return

    // If the XRWebGLBinding class is available then we can also query an
    // estimated reflection cube map.
    if ('XRWebGLBinding' in window) {
      // This is the simplest way I know of to initialize a WebGL cubemap in Three.
      const cubeRenderTarget = new WebGLCubeRenderTarget(16)
      xrLightProbeState.environment.set(cubeRenderTarget.texture)

      const gl = getComponent(Engine.instance.viewerEntity, RendererComponent).renderer!.getContext()

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

      probe.addEventListener('reflectionchange', () => {
        updateReflection()
      })
    }
  }, [xrLightProbeState.probe])

  return null
}

export const XRLightProbeSystem = defineSystem({
  uuid: 'ee.engine.XRLightProbeSystem',
  insert: { with: XRSystem },
  execute,
  reactor
})
