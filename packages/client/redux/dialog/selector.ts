import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('dialog');
export const selectDialogState = createSelector([selectState], (dialog) => dialog);
