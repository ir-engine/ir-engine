import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('friends');
export const selectFriendState = createSelector([selectState], (friend) => friend);
