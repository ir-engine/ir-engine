import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('videos');
const selectimgState = (state: any): any => state.get('image');
export const selectVideoState = createSelector([selectState], (videos) => videos);
export const selectImageState = createSelector([selectimgState], (image) => image);
