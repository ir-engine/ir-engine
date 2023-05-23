import { Quaternion, Vector3 } from 'three'
import matches from 'ts-matches'

import { defineAction, defineState, getState, syncStateWithLocalStorage } from '@etherealengine/hyperflux'

import { AvatarInputSettingsState } from '../avatar/state/AvatarInputSettingsState'
import { Entity } from '../ecs/classes/Entity'
import { NetworkTopics } from '../networking/classes/Network'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { DepthDataTexture } from './DepthDataTexture'
import { XREstimatedLight } from './XREstimatedLight'

// TODO: divide this up into the systems that manage these states
export const XRState = defineState({
  name: 'XRState',
  initial: () => {
    return {
      sessionActive: false, // TODO: remove this; it's redundant, just need to check if session exists
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
      unassingedInputSources: [] as XRInputSource[],
      session: null as XRSession | null,
      sessionMode: 'none' as 'inline' | 'immersive-ar' | 'immersive-vr' | 'none',
      avatarCameraMode: 'auto' as 'auto' | 'attached' | 'detached',
      localAvatarScale: 1,
      /** Stores the depth map data - will exist if depth map is supported */
      depthDataTexture: null as DepthDataTexture | null,
      is8thWallActive: false,
      isEstimatingLight: false,
      lightEstimator: null! as XREstimatedLight,
      viewerInputSourceEntity: 0 as Entity,
      viewerPose: null as XRViewerPose | null | undefined,
      userEyeLevel: 1.8,
      //to be moved to user_settings
      userHeight: 0
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

  static spawnIKTarget = defineAction({
    ...WorldNetworkAction.spawnObject.actionShape,
    prefab: 'ik-target',
    handedness: matches.literals('left', 'right', 'none'),
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })
}

export const getCameraMode = () => {
  const { avatarCameraMode, sceneScale, scenePlacementMode, session } = getState(XRState)
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
  const { sessionActive, sceneScale, sessionMode, session } = getState(XRState)
  if (!sessionActive) return true
  if (session && session.interactionMode === 'screen-space') return true
  return sessionMode === 'immersive-ar' ? sceneScale !== 1 : true
}

/**
 * Gets the preferred controller entity - will return null if the entity is not in an active session or the controller is not available
 * @param {boolean} offhand specifies to return the non-preferred hand instead
 * @returns {Entity}
 */
export const getPreferredInputSource = (inputSources: readonly XRInputSource[], offhand = false) => {
  const xrState = getState(XRState)
  if (!xrState.sessionActive) return
  const avatarInputSettings = getState(AvatarInputSettingsState)
  for (const inputSource of inputSources) {
    if (inputSource.handedness === 'none') continue
    if (!offhand && avatarInputSettings.preferredHand == inputSource.handedness) return inputSource
    if (offhand && avatarInputSettings.preferredHand !== inputSource.handedness) return inputSource
  }
}

/**
 * Wheter or not this is a mobile XR headset
 **/
export const isMobileXRHeadset =
  'navigator' in globalThis === false
    ? false
    : navigator.userAgent.includes('Oculus') ||
      navigator.userAgent.includes('VR') ||
      navigator.userAgent.includes('AR') ||
      navigator.userAgent.includes('Reality') ||
      navigator.userAgent.includes('Wolvic')
