import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('clientSettings')
}

export const selectClientSettingState = createSelector([selectState], (clientSettings) => clientSettings)
