import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('groupUsers')
export const selectGroupUserState = createSelector([selectState], (groupUser) => groupUser)
