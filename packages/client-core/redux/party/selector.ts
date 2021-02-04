import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('party');
export const selectPartyState = createSelector([selectState], (party) => party);
