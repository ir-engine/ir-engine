import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('seat');
export const selectSeatState = createSelector([selectState], (seat) => seat);
