import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('locations');
export const selectLocationState = createSelector([selectState], (locations) => locations);
