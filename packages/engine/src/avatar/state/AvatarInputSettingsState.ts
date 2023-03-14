import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { XR_FOLLOW_MODE, XR_ROTATION_MODE } from '@etherealengine/engine/src/xr/XRUserSettings'
import {
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  syncStateWithLocalStorage,
  useState
} from '@etherealengine/hyperflux'

export const AvatarAxesControlScheme = {
  Move: 'AvatarControlScheme_Move' as const,
  Teleport: 'AvatarControlScheme_Teleport' as const
}

export const AvatarControllerType = {
  None: 'AvatarControllerType_None' as const,
  XRHands: 'AvatarControllerType_XRHands' as const,
  OculusQuest: 'AvatarControllerType_OculusQuest' as const
}

export const AvatarInputSettingsState = defineState({
  name: 'AvatarInputSettingsState',
  initial: () => ({
    controlType: AvatarControllerType.None as typeof AvatarControllerType[keyof typeof AvatarControllerType],

    leftAxesControlScheme:
      AvatarAxesControlScheme.Move as typeof AvatarAxesControlScheme[keyof typeof AvatarAxesControlScheme],
    rightAxesControlScheme:
      AvatarAxesControlScheme.Teleport as typeof AvatarAxesControlScheme[keyof typeof AvatarAxesControlScheme],

    preferredHand: 'right' as 'left' | 'right',
    invertRotationAndMoveSticks: true,
    // TODO: implement the following
    moving: XR_FOLLOW_MODE.CONTROLLER as XR_FOLLOW_MODE,
    // rotation mode
    rotation: XR_ROTATION_MODE.ANGLED as XR_ROTATION_MODE,
    // 0.1, 0.3, 0.5, 0.8, 1
    rotationSmoothSpeed: 0.1,
    // 15, 30, 45, 60
    rotationAngle: 30,
    rotationInvertAxes: true,
    showAvatar: true
  }),
  onCreate: (store, state) => {
    syncStateWithLocalStorage(AvatarInputSettingsState, [
      'controlType',
      'controlScheme',
      'preferredHand',
      'invertRotationAndMoveSticks',
      'moving',
      'rotation',
      'rotationSmoothSpeed',
      'rotationAngle',
      'rotationInvertAxes',
      'showAvatar'
    ])
  }
})

export function AvatarInputSettingsReceptor(action) {
  const s = getMutableState(AvatarInputSettingsState)
  matches(action)
    .when(AvatarInputSettingsAction.setControlType.matches, (action) => {
      return s.controlType.set(action.controlType)
    })
    .when(AvatarInputSettingsAction.setLeftAxesControlScheme.matches, (action) => {
      return s.leftAxesControlScheme.set(action.scheme)
    })
    .when(AvatarInputSettingsAction.setRightAxesControlScheme.matches, (action) => {
      return s.rightAxesControlScheme.set(action.scheme)
    })
    .when(AvatarInputSettingsAction.setPreferredHand.matches, (action) => {
      return s.preferredHand.set(action.handdedness)
    })
    .when(AvatarInputSettingsAction.setInvertRotationAndMoveSticks.matches, (action) => {
      return s.invertRotationAndMoveSticks.set(action.invertRotationAndMoveSticks)
    })
    .when(AvatarInputSettingsAction.setShowAvatar.matches, (action) => {
      return s.showAvatar.set(action.showAvatar)
    })
}

export class AvatarInputSettingsAction {
  static setControlType = defineAction({
    type: 'xre.avatar.AvatarInputSettings.AVATAR_SET_CONTROL_TYPE' as const,
    controlType: matches.string as Validator<unknown, typeof AvatarControllerType[keyof typeof AvatarControllerType]>
  })

  static setLeftAxesControlScheme = defineAction({
    type: 'xre.avatar.AvatarInputSettings.AVATAR_SET_LEFT_CONTROL_SCHEME' as const,
    scheme: matches.string as Validator<unknown, typeof AvatarAxesControlScheme[keyof typeof AvatarAxesControlScheme]>
  })

  static setRightAxesControlScheme = defineAction({
    type: 'xre.avatar.AvatarInputSettings.AVATAR_SET_RIGHT_CONTROL_SCHEME' as const,
    scheme: matches.string as Validator<unknown, typeof AvatarAxesControlScheme[keyof typeof AvatarAxesControlScheme]>
  })

  static setPreferredHand = defineAction({
    type: 'xre.avatar.AvatarInputSettings.AVATAR_SET_PREFERRED_HAND' as const,
    handdedness: matches.string as Validator<unknown, 'left' | 'right'>
  })

  static setInvertRotationAndMoveSticks = defineAction({
    type: 'xre.avatar.AvatarInputSettings.SET_INVERT_ROTATION_AND_MOVE_STICKS' as const,
    invertRotationAndMoveSticks: matches.boolean
  })

  static setShowAvatar = defineAction({
    type: 'xre.avatar.AvatarInputSettings.SET_SHOW_AVATAR' as const,
    showAvatar: matches.boolean
  })
}
