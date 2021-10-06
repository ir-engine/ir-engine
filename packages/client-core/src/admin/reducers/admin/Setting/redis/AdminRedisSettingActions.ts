export const AdminRedisSettingAction = {
  redisSettingRetrieved: (data) => {
    return {
      type: 'ADMIN_REDIS_SETTING_FETCHED' as const,
      list: data
    }
  }
}

export type AdminRedisSettingActionType = ReturnType<
  typeof AdminRedisSettingAction[keyof typeof AdminRedisSettingAction]
>
