import Immutable from 'immutable'
import {
  CAM_VIDEO_CHANGED,
  CAM_AUDIO_CHANGED,
  FACE_TRACKING_CHANGED,
  CONSUMERS_CHANGED,
  NEARBY_LAYER_USERS_CHANGED
} from '../actions'
import { BooleanAction } from './actions'

export const initialMediaStreamState = {
  isCamVideoEnabled: false,
  isCamAudioEnabled: false,
  isFaceTrackingEnabled: false,
  nearbyLayerUsers: [],
  consumers: {
    consumers: []
  }
}

const immutableState = Immutable.fromJS(initialMediaStreamState) as any

export default function mediastreamReducer(state = immutableState, action: any): any {
  let updateMap
  switch (action.type) {
    case CAM_VIDEO_CHANGED:
      return state.set('isCamVideoEnabled', (action as BooleanAction).isEnable)
    case CAM_AUDIO_CHANGED:
      return state.set('isCamAudioEnabled', (action as BooleanAction).isEnable)
    case FACE_TRACKING_CHANGED:
      return state.set('isFaceTrackingEnabled', (action as BooleanAction).isEnable)
    case CONSUMERS_CHANGED:
      updateMap = new Map()
      updateMap.set('consumers', action.consumers)
      return state.set('consumers', updateMap)
    case NEARBY_LAYER_USERS_CHANGED:
      return state.set(
        'nearbyLayerUsers',
        action.users.map((user) => user.id)
      )
  }

  return state
}
