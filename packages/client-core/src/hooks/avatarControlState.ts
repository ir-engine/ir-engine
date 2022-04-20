import { AvatarInputActionType, state } from '@xrengine/engine/src/avatar/state/AvatarInputState'

import { store } from '../store'

store.receptors.push((action: AvatarInputActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'AVATAR_SET_CONTROL_MODEL':
        return s.merge({ controlType: action.controlType })
      case 'SET_INVERT_ROTATION_AND_MOVE_STICKS':
        return s.merge({ invertRotationAndMoveSticks: action.invertRotationAndMoveSticks })
    }
  }, action.type)
})
