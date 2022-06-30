import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { XR_FOLLOW_MODE, XR_ROTATION_MODE } from '@xrengine/engine/src/xr/types/XRUserSettings'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

type AvatarInputSettingsStateType = {
  controlType: 'None' | 'XR Hands' | 'Oculus Quest'
  invertRotationAndMoveSticks: boolean
  moving: number
  rotation: number
  rotationSmoothSpeed: number
  rotationAngle: number
  rotationInvertAxes: boolean
  showAvatar: boolean
}

const AvatarInputSettingsState = defineState({
  name: 'AvatarInputSettingsState',
  initial: () => ({
    controlType: 'None',
    invertRotationAndMoveSticks: true,
    // TODO: implement the following
    moving: XR_FOLLOW_MODE.CONTROLLER,
    // rotation mode
    rotation: XR_ROTATION_MODE.ANGLED,
    // 0.1, 0.3, 0.5, 0.8, 1
    rotationSmoothSpeed: 0.1,
    // 15, 30, 45, 60
    rotationAngle: 30,
    rotationInvertAxes: true,
    showAvatar: true
  })
})

export function AvatarInputSettingsReceptor(action) {
  getState(AvatarInputSettingsState).batch((s) => {
    matches(action)
      .when(AvatarInputSettingsAction.setControlType.matches, (action) => {
        return s.merge({ controlType: action.controlType })
      })
      .when(AvatarInputSettingsAction.setInvertRotationAndMoveSticks.matches, (action) => {
        return s.merge({ invertRotationAndMoveSticks: action.invertRotationAndMoveSticks })
      })
      .when(AvatarInputSettingsAction.setShowAvatar.matches, (action) => {
        return s.merge({ showAvatar: action.showAvatar })
      })
  })
}

export const accessAvatarInputSettingsState = () => getState(AvatarInputSettingsState)
export const useAvatarInputSettingsState = () => useState(accessAvatarInputSettingsState())

export class AvatarInputSettingsAction {
  static setControlType = defineAction({
    type: 'AVATAR_SET_CONTROL_MODEL' as const,
    controlType: matches.string as Validator<unknown, AvatarInputSettingsStateType['controlType']>
  })

  static setInvertRotationAndMoveSticks = defineAction({
    type: 'SET_INVERT_ROTATION_AND_MOVE_STICKS' as const,
    invertRotationAndMoveSticks: matches.boolean
  })

  static setShowAvatar = defineAction({
    type: 'SET_SHOW_AVATAR' as const,
    showAvatar: matches.boolean
  })
}
