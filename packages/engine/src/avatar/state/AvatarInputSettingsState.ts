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

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getMutableState, syncStateWithLocalStorage } from '@etherealengine/hyperflux'

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
    controlType: AvatarControllerType.None as (typeof AvatarControllerType)[keyof typeof AvatarControllerType],
    leftAxesControlScheme:
      AvatarAxesControlScheme.Move as (typeof AvatarAxesControlScheme)[keyof typeof AvatarAxesControlScheme],
    rightAxesControlScheme:
      AvatarAxesControlScheme.Teleport as (typeof AvatarAxesControlScheme)[keyof typeof AvatarAxesControlScheme],
    preferredHand: 'right' as 'left' | 'right',
    invertRotationAndMoveSticks: true,
    showAvatar: true
  }),
  onCreate: (store, state) => {
    syncStateWithLocalStorage(AvatarInputSettingsState, [
      'controlType',
      'leftAxesControlScheme',
      'rightAxesControlScheme',
      'preferredHand',
      'invertRotationAndMoveSticks',
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
    controlType: matches.string as Validator<unknown, (typeof AvatarControllerType)[keyof typeof AvatarControllerType]>
  })

  static setLeftAxesControlScheme = defineAction({
    type: 'xre.avatar.AvatarInputSettings.AVATAR_SET_LEFT_CONTROL_SCHEME' as const,
    scheme: matches.string as Validator<unknown, (typeof AvatarAxesControlScheme)[keyof typeof AvatarAxesControlScheme]>
  })

  static setRightAxesControlScheme = defineAction({
    type: 'xre.avatar.AvatarInputSettings.AVATAR_SET_RIGHT_CONTROL_SCHEME' as const,
    scheme: matches.string as Validator<unknown, (typeof AvatarAxesControlScheme)[keyof typeof AvatarAxesControlScheme]>
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
