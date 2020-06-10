import { createSelector } from 'reselect'

const selectState = (state: any) => state.get('scenes')
export const selectScenesState = createSelector([selectState], (scenes) => scenes)
