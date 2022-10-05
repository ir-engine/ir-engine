import matches from 'ts-matches'

import { defineState, getState } from '@xrengine/hyperflux'
import { defineAction } from '@xrengine/hyperflux'

import { Entity } from '../ecs/classes/Entity'
import { NetworkTopics } from '../networking/classes/Network'
import { DepthDataTexture } from './DepthDataTexture'

export const XRState = defineState({
  name: 'XRState',
  initial: () => ({
    sessionActive: false,
    requestingSession: false,
    scenePlacementMode: false,
    supportedSessionModes: {
      inline: false,
      'immersive-ar': false,
      'immersive-vr': false
    },
    sessionMode: 'none' as 'inline' | 'immersive-ar' | 'immersive-vr' | 'none',
    /**
     * The `avatarControlMode` property can be 'auto', 'attached', or 'detached'.
     * When `avatarControlMode` is 'attached' the avatar's head is attached to the XR display.
     * When `avatarControlMode` is 'detached' the avatar can move freely via movement controls (e.g., joystick).
     * When `avatarControlMode` is 'auto', the avatar will switch between these modes automtically based on the current XR session mode and other heursitics.
     */
    avatarControlMode: 'auto' as 'auto' | 'attached' | 'detached',
    originReferenceSpace: null as XRReferenceSpace | null,
    viewerReferenceSpace: null as XRReferenceSpace | null,
    viewerHitTestSource: null as XRHitTestSource | null,
    viewerHitTestEntity: NaN as Entity,
    sceneRotationOffset: 0,
    /** Stores the depth map data - will exist if depth map is supported */
    depthDataTexture: null as DepthDataTexture | null
  })
})

export const XRReceptors = {
  scenePlacementMode: (action: ReturnType<typeof XRAction.changePlacementMode>) => {
    getState(XRState).scenePlacementMode.set(action.active)
  }
}

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
    $cache: { removePrevious: true },
    $topic: NetworkTopics.world
  })

  static changePlacementMode = defineAction({
    type: 'xre.xr.changePlacementMode',
    active: matches.boolean
  })
}

export const getControlMode = () => {
  const { avatarControlMode, sessionMode, sessionActive } = getState(XRState).value
  if (!sessionActive) return 'none'
  if (avatarControlMode === 'auto') {
    return sessionMode === 'immersive-vr' || sessionMode === 'inline' ? 'attached' : 'detached'
  }
  return avatarControlMode
}
