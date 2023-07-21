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

import { Quaternion, Vector3 } from 'three'

import { createHookableFunction } from '@etherealengine/common/src/utils/createHookableFunction'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { AvatarHeadDecapComponent } from '../avatar/components/AvatarIKComponents'
import { V_000 } from '../common/constants/MathConstants'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { setVisibleComponent } from '../scene/components/VisibleComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { computeAndUpdateWorldOrigin, updateEyeHeight } from '../transform/updateWorldOrigin'
import { Engine } from './../ecs/classes/Engine'
import { addComponent, getComponent, hasComponent } from './../ecs/functions/ComponentFunctions'
import { EngineRenderer } from './../renderer/WebGLRendererSystem'
import { ReferenceSpace, XRAction, XRState, getCameraMode } from './XRState'

const quat180y = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

export const onSessionEnd = () => {
  const xrState = getMutableState(XRState)
  xrState.session.value!.removeEventListener('end', onSessionEnd)
  xrState.sessionActive.set(false)
  xrState.sessionMode.set('none')
  xrState.session.set(null)
  xrState.sceneScale.set(1)

  Engine.instance.xrFrame = null

  EngineRenderer.instance.renderer.domElement.style.display = ''
  setVisibleComponent(Engine.instance.localClientEntity, true)

  const worldOriginTransform = getComponent(Engine.instance.originEntity, TransformComponent)
  worldOriginTransform.position.copy(V_000)
  worldOriginTransform.rotation.identity()

  ReferenceSpace.origin = null
  ReferenceSpace.localFloor = null
  ReferenceSpace.viewer = null

  dispatchAction(XRAction.sessionChanged({ active: false }))

  xrState.session.set(null)
}

export const setupXRSession = async (requestedMode?: 'inline' | 'immersive-ar' | 'immersive-vr') => {
  const xrState = getMutableState(XRState)
  const xrManager = EngineRenderer.instance.xrManager

  // @todo - hack to detect nreal
  const params = new URL(document.location.href).searchParams
  const isXREAL = params.has('xreal')

  const sessionInit = {
    optionalFeatures: [
      'local-floor',
      'hand-tracking',
      'layers',
      isXREAL ? undefined : 'dom-overlay', // dom overlay crashes nreal
      'hit-test',
      'light-estimation',
      'depth-sensing',
      'anchors',
      'plane-detection',
      'camera-access'
    ].filter(Boolean),
    depthSensing: {
      usagePreference: ['cpu-optimized', 'gpu-optimized'],
      dataFormatPreference: ['luminance-alpha', 'float32']
    },
    domOverlay: isXREAL ? undefined : { root: document.body }
  } as XRSessionInit
  const mode =
    requestedMode ||
    (xrState.supportedSessionModes['immersive-ar'].value
      ? 'immersive-ar'
      : xrState.supportedSessionModes['immersive-vr'].value
      ? 'immersive-vr'
      : 'inline')

  xrState.requestingSession.set(true)

  const xrSession = await navigator.xr!.requestSession(mode, sessionInit)

  // OculusBrowser incorrectly reports that the interaction mode is 'screen-space' when it should be 'world-space'
  // This can be removed when the bug is fixed
  const isOculus = navigator.userAgent.includes('OculusBrowser')
  if (isOculus) {
    Object.defineProperty(xrSession, 'interactionMode', {
      value: 'world-space'
    })
  }

  const framebufferScaleFactor =
    xrSession.interactionMode === 'screen-space' && xrSession.domOverlayState?.type === 'screen' ? 0.5 : 1.2

  xrState.sessionActive.set(true)

  xrState.sessionMode.set(mode)

  await xrManager.setSession(xrSession, framebufferScaleFactor)

  /** Hide the canvas - do not do this for the WebXR emulator */
  /** @todo currently, XRSession.visibilityState is undefined in the webxr emulator - we need a better check*/
  if (typeof xrSession.visibilityState === 'string') {
    EngineRenderer.instance.renderer.domElement.style.display = 'none'
  }

  xrState.session.set(xrSession)

  xrState.requestingSession.set(false)

  return xrSession
}

export const getReferenceSpaces = (xrSession: XRSession) => {
  const worldOriginTransform = getComponent(Engine.instance.originEntity, TransformComponent)
  const localClientEntity = Engine.instance.localClientEntity
  const rigidBody = localClientEntity
    ? getComponent(localClientEntity, RigidBodyComponent)
    : getComponent(Engine.instance.cameraEntity, TransformComponent)

  /** since the world origin is based on gamepad movement, we need to transform it by the pose of the avatar */
  worldOriginTransform.position.copy(rigidBody.position)
  worldOriginTransform.rotation.copy(rigidBody.rotation).multiply(quat180y)

  /** the world origin is an offset to the local floor, so as soon as we have the local floor, define the origin reference space */
  xrSession.requestReferenceSpace('local-floor').then((space) => {
    // WebXR Emulator does not support XRReferenceSpace events
    if ('addEventListener' in space)
      space.addEventListener('reset', (ev) => {
        updateEyeHeight()
      })
    ReferenceSpace.localFloor = space
    computeAndUpdateWorldOrigin()
  })

  xrSession.requestReferenceSpace('viewer').then((space) => (ReferenceSpace.viewer = space))
}

/**
 * A hookable function that is fired when the XR Session is requested
 * @returns
 */
export const requestXRSession = createHookableFunction(
  async (action: { mode?: 'inline' | 'immersive-ar' | 'immersive-vr' } = {}): Promise<void> => {
    const xrState = getMutableState(XRState)
    if (xrState.requestingSession.value || xrState.sessionActive.value) return

    try {
      const xrSession = await setupXRSession(action.mode)

      getReferenceSpaces(xrSession)

      dispatchAction(XRAction.sessionChanged({ active: true }))

      xrSession.addEventListener('end', onSessionEnd)
    } catch (e) {
      console.error('Failed to create XR Session', e)
    }
  }
)

/**
 * A hookable function that is fired when the XR Session has ended
 * @returns
 */
export const endXRSession = createHookableFunction(async () => {
  await getMutableState(XRState).session.value?.end()
})

/**
 * A hookable function that is fired when the XR Session has changed
 * @returns
 */
export const xrSessionChanged = createHookableFunction((action: typeof XRAction.sessionChanged.matches._TYPE) => {
  const entity = Engine.instance.getUserAvatarEntity(action.$from)
  if (!entity) return

  if (action.active) {
    if (getCameraMode() === 'attached') {
      if (!hasComponent(entity, AvatarHeadDecapComponent)) addComponent(entity, AvatarHeadDecapComponent, true)
    }
  }
})
