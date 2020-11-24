import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('devicedetect');
export const selectDeviceDetectState = createSelector([selectState], (devicedetect) => devicedetect);
