import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('auth');
export const selectAuthState = createSelector([selectState], (auth) => auth);
