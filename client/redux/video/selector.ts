import { createSelector } from 'reselect'

const selectState = (state: any) => state.get('videos')
const selectimgState = (state: any) => state.get('image')
export const selectVideoState = createSelector([selectState], (videos) => videos)
export const selectImageState = createSelector([selectimgState], (image) => image)
