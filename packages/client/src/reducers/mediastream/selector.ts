import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('mediastream')
export const selectMediastreamState = createSelector([selectState], (mediastream) => mediastream)
