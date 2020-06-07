import { createSelector } from 'reselect'

const selectState = (state: any) => state.get('video360')
export const selectVideo360State = createSelector([selectState], video360 => video360)
