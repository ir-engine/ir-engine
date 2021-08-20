import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('feedsAdmin')
}
export const selectAdminFeedsState = createSelector([selectState], (feedsAdmin) => feedsAdmin)
