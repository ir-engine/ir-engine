import { AdminRedisSettingResult } from '@standardcreative/common/src/interfaces/AdminAuthSettingResult'

export const AuthSettingAction = {
  authSettingRetrieved: (adminRedisSettingResult: AdminRedisSettingResult) => {
    return {
      type: 'ADMIN_AUTH_SETTING_FETCHED' as const,
      adminRedisSettingResult: adminRedisSettingResult
    }
  },
  authSettingPatched: (data: AdminRedisSettingResult) => {
    return {
      type: 'ADMIN_AUTH_SETTING_PATCHED' as const
    }
  }
}

export type AuthSettingActionType = ReturnType<typeof AuthSettingAction[keyof typeof AuthSettingAction]>
