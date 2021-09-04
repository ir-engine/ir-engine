import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('adminAnalytics')
}

export const selectAnalyticsState = createSelector([selectState], (analyticsState) => analyticsState)
