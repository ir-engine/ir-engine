import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('groups');
export const selectGroupState = createSelector([selectState], (group) => group);
