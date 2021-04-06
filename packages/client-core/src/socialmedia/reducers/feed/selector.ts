import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('feeds');
export const selectFeedsState = createSelector([selectState], (feeds) => feeds);
