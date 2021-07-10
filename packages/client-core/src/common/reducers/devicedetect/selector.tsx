import { createSelector } from 'reselect'
import { DeviceDetectState } from './actions'

const selectState = (state: any) => state.get('devicedetect') as DeviceDetectState
export const selectDeviceDetectState = createSelector([selectState], (devicedetect) => devicedetect)
