import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('invite');
export const selectInviteState = createSelector([selectState], (invite) => invite);
