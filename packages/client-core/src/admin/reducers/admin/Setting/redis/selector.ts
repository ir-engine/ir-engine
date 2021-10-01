import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('adminRedisSetting')
}

export const selectAdminRedisSettingState = createSelector([selectState], (adminRedisSetting) => adminRedisSetting)
