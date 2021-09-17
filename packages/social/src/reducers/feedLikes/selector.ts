import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('feedFires')
export const selectFeedLikesState = createSelector([selectState], (feedLikes) => feedLikes)
