import { createState, State, useState } from '@speigg/hookstate'

import { store } from '@xrengine/client-core/src/store'

type AvatarInputStateType = {
  controlType: string | null
}

const state = createState<AvatarInputStateType>({
  controlType: 'None'
})

type StateType = State<typeof state.value>

store.receptors.push((action: AvatarInputActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'AVATAR_SET_CONTROL_MODEL':
        return s.merge({ controlType: action.controlType })
    }
  }, action.type)
})

export const useAvatarInputState = () => useState(state) as any as typeof state
export const accessAvatarInputState = () => state

export const AvatarInputAction = {
  setControlType: (controlType: string) => {
    return {
      type: 'AVATAR_SET_CONTROL_MODEL' as const,
      controlType
    }
  }
}

export type AvatarInputActionType = ReturnType<typeof AvatarInputAction[keyof typeof AvatarInputAction]>
