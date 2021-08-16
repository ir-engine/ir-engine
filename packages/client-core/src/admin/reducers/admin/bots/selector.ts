import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('adminBots')
}

export const selectAdminBotsState = createSelector([selectState], (adminBots) => adminBots)
