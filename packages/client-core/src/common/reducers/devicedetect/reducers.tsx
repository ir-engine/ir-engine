import Immutable from 'immutable'
import { DeviceDetectAction, DeviceDetectState } from './actions'
import { DETECT_DEVICE_TYPE } from '../../../user/reducers/actions'

export const initialDeviceDetectState: DeviceDetectState = {
  isDetected: false,
  content: undefined
}

const immutableState = Immutable.fromJS(initialDeviceDetectState)

const detectDeviceReducer = (state = immutableState, action: DeviceDetectAction) => {
  switch (action.type) {
    case DETECT_DEVICE_TYPE:
      return state.set('isDetected', true).set('content', action.content)
    default:
      break
  }
  return state
}

export default detectDeviceReducer
