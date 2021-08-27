import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('adminAuthSetting')
}

export const selectAdminAuthSettingState = createSelector([selectState], (adminAuthSetting) => adminAuthSetting)
