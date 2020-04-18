import { createSelector } from 'reselect'

const selectState = (state: any) => state.get('dialog')
export const selectDialogState = createSelector([selectState], (dialog) => dialog)
