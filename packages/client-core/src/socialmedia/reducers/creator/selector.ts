import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('creators');
export const selectCreatorsState = createSelector([selectState], (creators) => creators);
