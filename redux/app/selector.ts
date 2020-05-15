import { createSelector } from 'reselect'

const selectState = (state: any) => state.get('app')
export const selectAppState = createSelector([selectState], app => app)
