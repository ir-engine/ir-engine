import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('friends')
export const selectInviteState = createSelector([selectState], (invite) => invite)
