import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('user');
export const selectUserState = createSelector([selectState], (user) => user);
