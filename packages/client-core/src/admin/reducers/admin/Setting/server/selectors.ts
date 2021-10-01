import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('serverSettings')
}

export const selectServerSettingState = createSelector([selectState], (serverSettings) => serverSettings)
