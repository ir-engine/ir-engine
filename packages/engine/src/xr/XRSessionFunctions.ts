import { Quaternion, Vector3 } from 'three'

import { createHookableFunction } from '@etherealengine/common/src/utils/createHookableFunction'
import { dispatchAction, getState } from '@etherealengine/hyperflux'

import { AvatarHeadDecapComponent } from '../avatar/components/AvatarIKComponents'
import { V_000 } from '../common/constants/MathConstants'
import { ButtonInputStateType, createInitialButtonState } from '../input/InputState'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { SkyboxComponent } from '../scene/components/SkyboxComponent'
import { setVisibleComponent } from '../scene/components/VisibleComponent'
import { updateSkybox } from '../scene/functions/loaders/SkyboxFunctions'
import { TransformComponent } from '../transform/components/TransformComponent'
import { computeAndUpdateWorldOrigin, updateEyeHeight } from '../transform/updateWorldOrigin'
import { matches } from './../common/functions/MatchesUtils'
import { Engine } from './../ecs/classes/Engine'
import { addComponent, defineQuery, getComponent, hasComponent } from './../ecs/functions/ComponentFunctions'
import { EngineRenderer } from './../renderer/WebGLRendererSystem'
import { getCameraMode, hasMovementControls, ReferenceSpace, XRAction, XRState } from './XRState'

const quat180y = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

const skyboxQuery = defineQuery([SkyboxComponent])

export const onSessionEnd = () => {
  const xrState = getState(XRState)
  xrState.session.value!.removeEventListener('end', onSessionEnd)
  xrState.sessionActive.set(false)
  xrState.sessionMode.set('none')
  xrState.session.set(null)
  xrState.sceneScale.set(1)

  Engine.instance.xrFrame = null
  const world = Engine.instance.currentWorld

  EngineRenderer.instance.renderer.domElement.style.display = ''
  setVisibleComponent(world.localClientEntity, true)

  const worldOriginTransform = getComponent(world.originEntity, TransformComponent)
  worldOriginTransform.position.copy(V_000)
  worldOriginTransform.rotation.identity()

  ReferenceSpace.origin = null
  ReferenceSpace.localFloor = null
  ReferenceSpace.viewer = null

  const skybox = skyboxQuery()[0]
  if (skybox) updateSkybox(skybox)
  dispatchAction(XRAction.sessionChanged({ active: false }))

  xrState.session.set(null)
}

export const setupXRSession = async (requestedMode) => {
  const xrState = getState(XRState)
  const xrManager = EngineRenderer.instance.xrManager

  const sessionInit = {
    optionalFeatures: [
      'local-floor',
      'hand-tracking',
      'layers',
      'dom-overlay',
      'hit-test',
      'light-estimation',
      'depth-sensing',
      'anchors',
      'plane-detection'
    ],
    depthSensing: {
      usagePreference: ['cpu-optimized', 'gpu-optimized'],
      dataFormatPreference: ['luminance-alpha', 'float32']
    },
    domOverlay: { root: document.body }
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

  xrManager.setFoveation(1)
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
  const world = Engine.instance.currentWorld
  const worldOriginTransform = getComponent(world.originEntity, TransformComponent)
  const rigidBody = getComponent(world.localClientEntity, RigidBodyComponent)
  const xrState = getState(XRState)

  /** since the world origin is based on gamepad movement, we need to transform it by the pose of the avatar */
  if (xrState.sessionMode.value === 'immersive-ar') {
    worldOriginTransform.position.copy(rigidBody.position)
    worldOriginTransform.rotation.copy(quat180y)
  } else {
    worldOriginTransform.position.copy(rigidBody.position)
    worldOriginTransform.rotation.copy(rigidBody.rotation).multiply(quat180y)
  }

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
  async (action: typeof XRAction.requestSession.matches._TYPE): Promise<void> => {
    const xrState = getState(XRState)
    if (xrState.requestingSession.value || xrState.sessionActive.value) return

    try {
      const xrSession = await setupXRSession(action.mode)
      const world = Engine.instance.currentWorld

      getReferenceSpaces(xrSession)

      const mode = xrState.sessionMode.value
      if (mode === 'immersive-ar') setupARSession(world)
      if (mode === 'immersive-vr') setupVRSession(world)

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
  await getState(XRState).session.value?.end()
})

/**
 * A hookable function that is fired when the XR Session has changed
 * @returns
 */
export const xrSessionChanged = createHookableFunction((action: typeof XRAction.sessionChanged.matches._TYPE) => {
  const entity = Engine.instance.currentWorld.getUserAvatarEntity(action.$from)
  if (!entity) return

  if (action.active) {
    if (getCameraMode() === 'attached') {
      if (!hasComponent(entity, AvatarHeadDecapComponent)) addComponent(entity, AvatarHeadDecapComponent, true)
    }
  }
})

export const setupVRSession = (world = Engine.instance.currentWorld) => {}

export const setupARSession = (world = Engine.instance.currentWorld) => {
  const session = getState(XRState).session.value!

  /**
   * AR uses the `select` event as taps on the screen for mobile AR sessions
   * This gets piped into the input system as a TouchInput.Touch
   */
  session.addEventListener('selectstart', () => {
    ;(world.buttons as ButtonInputStateType).PrimaryClick = createInitialButtonState()
  })
  session.addEventListener('selectend', (inputSource) => {
    const buttons = world.buttons as ButtonInputStateType
    if (!buttons.PrimaryClick) return
    buttons.PrimaryClick!.up = true
  })

  world.scene.background = null
}
