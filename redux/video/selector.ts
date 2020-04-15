import { createSelector } from 'reselect'

const selectState = (state: any) => state.get('videos')
export const selectVideoState = createSelector([selectState], (videos) => videos)
