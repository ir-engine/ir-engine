import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('contentPack')
}
export const selectContentPackState = createSelector([selectState], (contentPack) => contentPack)
