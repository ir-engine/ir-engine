import { createState, useState } from '@speigg/hookstate'

import { XR_FOLLOW_MODE, XR_ROTATION_MODE } from '@xrengine/engine/src/xr/types/XRUserSettings'

type AvatarInputSettingsStateType = {
  controlType: 'None' | 'XR Hands' | 'Oculus Quest'
  invertRotationAndMoveSticks: boolean
  moving: number
  rotation: number
  rotationSmoothSpeed: number
  rotationAngle: number
  rotationInvertAxes: boolean
}

const state = createState<AvatarInputSettingsStateType>({
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
  rotationInvertAxes: true
})

export function AvatarInputSettingsReceptor(action: AvatarInputSettingsActionType) {
  state.batch((s) => {
    switch (action.type) {
      case 'AVATAR_SET_CONTROL_MODEL':
        return s.merge({ controlType: action.controlType })
      case 'SET_INVERT_ROTATION_AND_MOVE_STICKS':
        return s.merge({ invertRotationAndMoveSticks: action.invertRotationAndMoveSticks })
    }
  }, action.type)
}

export const useAvatarInputSettingsState = () => useState(state) as any as typeof state
export const accessAvatarInputSettingsState = () => state

export const AvatarInputSettingsAction = {
  setControlType: (controlType: AvatarInputSettingsStateType['controlType']) => {
    return {
      store: 'ENGINE' as const,
      type: 'AVATAR_SET_CONTROL_MODEL' as const,
      controlType
    }
  },
  setInvertRotationAndMoveSticks: (invertRotationAndMoveSticks: boolean) => {
    return {
      store: 'ENGINE' as const,
      type: 'SET_INVERT_ROTATION_AND_MOVE_STICKS' as const,
      invertRotationAndMoveSticks
    }
  }
}

export type AvatarInputSettingsActionType = ReturnType<
  typeof AvatarInputSettingsAction[keyof typeof AvatarInputSettingsAction]
>
