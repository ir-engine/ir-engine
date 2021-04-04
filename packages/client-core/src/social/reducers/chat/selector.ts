import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('chat');
export const selectChatState = createSelector([selectState], (chat) => chat);
