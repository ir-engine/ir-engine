import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('groups')
export const selectSocialGroupState = createSelector([selectState], (group) => group)
