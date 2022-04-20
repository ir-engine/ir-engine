import { createState, State, useState } from '@speigg/hookstate'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { XR_FOLLOW_MODE, XR_ROTATION_MODE } from '@xrengine/engine/src/xr/types/XRUserSettings'

type AvatarInputStateType = {
  controlType: string | null
  invertRotationAndMoveSticks: boolean
  moving: number
  rotation: number
  rotationSmoothSpeed: number
  rotationAngle: number
  rotationInvertAxes: boolean
}

const state = createState<AvatarInputStateType>({
  controlType: 'None',
  invertRotationAndMoveSticks: true,
  moving: XR_FOLLOW_MODE.CONTROLLER,
  rotation: XR_ROTATION_MODE.ANGLED,
  rotationSmoothSpeed: 0.1, // 0.1, 0.3, 0.5, 0.8, 1 - only for Smooth
  rotationAngle: 30, // 15, 30, 45, 60 - only for Angler
  rotationInvertAxes: true
})

export function EngineAvatarInputReceptor(action: AvatarInputActionType) {
  state.batch((s) => {
    switch (action.type) {
      case 'AVATAR_SET_CONTROL_MODEL':
        return s.merge({ controlType: action.controlType })
      case 'SET_INVERT_ROTATION_AND_MOVE_STICKS':
        return s.merge({ invertRotationAndMoveSticks: action.invertRotationAndMoveSticks })
    }
  }, action.type)
}

type StateType = State<typeof state.value>

export const useAvatarInputState = () => useState(state) as any as typeof state
export const accessAvatarInputState = () => state

export const AvatarInputAction = {
  setControlType: (controlType: string) => {
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

export type AvatarInputActionType = ReturnType<typeof AvatarInputAction[keyof typeof AvatarInputAction]>
