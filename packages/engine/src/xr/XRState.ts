import { AxesHelper, Quaternion, Vector3 } from 'three'
import matches, { Validator } from 'ts-matches'

import {
  defineAction,
  defineState,
  getMutableState,
  syncStateWithLocalStorage,
  useHookstate
} from '@etherealengine/hyperflux'

import { AvatarInputSettingsState } from '../avatar/state/AvatarInputSettingsState'
import { isMobile } from '../common/functions/isMobile'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { hasComponent, setComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { addObjectToGroup } from '../scene/components/GroupComponent'
import { NameComponent } from '../scene/components/NameComponent'
import { VisibleComponent } from '../scene/components/VisibleComponent'
import { ObjectLayers } from '../scene/constants/ObjectLayers'
import { setObjectLayers } from '../scene/functions/setObjectLayers'
import { setLocalTransformComponent } from '../transform/components/TransformComponent'
import { DepthDataTexture } from './DepthDataTexture'
import { XRHitTestComponent } from './XRComponents'
import { XREstimatedLight } from './XREstimatedLight'

// TODO: divide this up into the systems that manage these states
export const XRState = defineState({
  name: 'XRState',
  initial: () => {
    return {
      sessionActive: false,
      requestingSession: false,
      scenePosition: new Vector3(),
      sceneRotation: new Quaternion(),
      sceneScale: 1,
      sceneRotationOffset: 0,
      scenePlacementMode: 'unplaced' as 'unplaced' | 'placing' | 'placed',
      supportedSessionModes: {
        inline: false,
        'immersive-ar': false,
        'immersive-vr': false
      },
      session: null as XRSession | null,
      sessionMode: 'none' as 'inline' | 'immersive-ar' | 'immersive-vr' | 'none',
      avatarCameraMode: 'auto' as 'auto' | 'attached' | 'detached',
      /** Stores the depth map data - will exist if depth map is supported */
      depthDataTexture: null as DepthDataTexture | null,
      is8thWallActive: false,
      isEstimatingLight: false,
      lightEstimator: null! as XREstimatedLight,
      viewerInputSourceEntity: 0 as Entity,
      viewerPose: null as XRViewerPose | null | undefined,
      userEyeLevel: 1.8
    }
  },

  onCreate: (store, state) => {
    syncStateWithLocalStorage(XRState, [
      /** @todo replace this wither user_settings table entry */
      'userEyeLevel'
    ])
  }
})

export const ReferenceSpace = {
  /**
   * The scene origin reference space describes where the origin of the tracking space is
   */
  origin: null as XRReferenceSpace | null,
  /**
   * @see https://www.w3.org/TR/webxr/#dom-xrreferencespacetype-local-floor
   */
  localFloor: null as XRReferenceSpace | null,
  /**
   * @see https://www.w3.org/TR/webxr/#dom-xrreferencespacetype-viewer
   */
  viewer: null as XRReferenceSpace | null
}
globalThis.ReferenceSpace = ReferenceSpace

export class XRAction {
  static requestSession = defineAction({
    type: 'xre.xr.requestSession' as const,
    mode: matches.literals('inline', 'immersive-ar', 'immersive-vr').optional()
  })

  static endSession = defineAction({
    type: 'xre.xr.endSession' as const
  })

  static sessionChanged = defineAction({
    type: 'xre.xr.sessionChanged' as const,
    active: matches.boolean,
    $cache: { removePrevious: true }
  })

  // todo, support more haptic formats other than just vibrating controllers
  static vibrateController = defineAction({
    type: 'xre.xr.vibrateController',
    handedness: matches.literals('left', 'right'),
    value: matches.number,
    duration: matches.number
  })
}

export const getCameraMode = () => {
  const { avatarCameraMode, sceneScale, scenePlacementMode, session } = getMutableState(XRState).value
  if (!session || scenePlacementMode === 'placing') return 'detached'
  if (avatarCameraMode === 'auto') {
    if (session.interactionMode === 'screen-space') return 'detached'
    return sceneScale !== 1 ? 'detached' : 'attached'
  }
  return avatarCameraMode
}

/**
 * Specifies that the user has movement controls if:
 * - they are not in an immersive session
 * - they are in an immersive session with a screen-space interaction mode
 * - they are in an immersive-ar session with a scene scale of 1
 * @returns {boolean} true if the user has movement controls
 */
export const hasMovementControls = () => {
  const { sessionActive, sceneScale, sessionMode, session } = getMutableState(XRState).value
  if (!sessionActive) return true
  if (session && session.interactionMode === 'screen-space') return true
  return sessionMode === 'immersive-ar' ? sceneScale !== 1 : true
}

/**
 * Gets the preferred controller entity - will return null if the entity is not in an active session or the controller is not available
 * @param {boolean} offhand specifies to return the non-preferred hand instead
 * @returns {Entity}
 */
export const getPreferredInputSource = (inputSources: XRInputSourceArray, offhand = false) => {
  const xrState = getMutableState(XRState)
  if (!xrState.sessionActive.value) return
  const avatarInputSettings = getMutableState(AvatarInputSettingsState)
  for (const inputSource of inputSources) {
    if (inputSource.handedness === 'none') continue
    if (!offhand && avatarInputSettings.preferredHand.value == inputSource.handedness) return inputSource
    if (offhand && avatarInputSettings.preferredHand.value !== inputSource.handedness) return inputSource
  }
}

/**
 * @deprecated prefer using a more fine-grained feature or cabability detection, e.g.,
 * xrState.session.interactionMode === 'world-space'
 * or
 * renderState.qualityLevel > 2
 * */
export const isHeadset = () => {
  const supportedSessionModes = getMutableState(XRState).supportedSessionModes
  if (isMobile || typeof globalThis.CustomWebXRPolyfill !== 'undefined') return false
  return supportedSessionModes['immersive-vr'].value || supportedSessionModes['immersive-ar'].value
}

/**
 * @deprecated prefer using a more fine-grained feature or cabability detection, e.g.,
 * xrState.session.interactionMode === 'world-space'
 * or
 * renderState.qualityLevel > 2
 * */
export const useIsHeadset = () => {
  const supportedSessionModes = useHookstate(getMutableState(XRState).supportedSessionModes)
  if (isMobile || typeof globalThis.CustomWebXRPolyfill !== 'undefined') return false
  return supportedSessionModes['immersive-vr'].value || supportedSessionModes['immersive-ar'].value
}
