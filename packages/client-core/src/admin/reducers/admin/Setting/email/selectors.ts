import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('email')
}

export const selectEmailSettingState = createSelector([selectState], (email) => email)
