import { AdminRedisSettingResult } from '@xrengine/common/src/interfaces/AdminRedisSettingResult'

export const AdminRedisSettingAction = {
  redisSettingRetrieved: (adminRedisSettingResult: AdminRedisSettingResult) => {
    return {
      type: 'ADMIN_REDIS_SETTING_FETCHED' as const,
      adminRedisSettingResult: adminRedisSettingResult
    }
  }
}

export type AdminRedisSettingActionType = ReturnType<
  typeof AdminRedisSettingAction[keyof typeof AdminRedisSettingAction]
>
