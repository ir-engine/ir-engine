import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { AdminRedisSettingActionType } from './AdminRedisSettingActions'
import { AdminRedisSetting } from '@standardcreative/common/src/interfaces/AdminRedisSetting'

const state = createState({
  redisSettings: {
    redisSettings: [] as Array<AdminRedisSetting>,
    skip: 0,
    limit: 100,
    total: 0,
    updateNeeded: true
  }
})

export const receptor = (action: AdminRedisSettingActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_REDIS_SETTING_FETCHED':
        result = action.adminRedisSettingResult
        return s.redisSettings.merge({ redisSettings: result.data, updateNeeded: false })
    }
  }, action.type)
}

export const accessAdminRedisSettingState = () => state

export const useAdminRedisSettingState = () => useState(state) as any as typeof state
