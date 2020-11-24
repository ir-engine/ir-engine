import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('alert');
export const selectAlertState = createSelector([selectState], (alert) => alert);
