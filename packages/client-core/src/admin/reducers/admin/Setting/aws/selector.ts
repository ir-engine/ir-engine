import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('adminAwsSetting')
}

export const selectAdminAwsSettingState = createSelector([selectState], (adminAwsSetting) => adminAwsSetting)
