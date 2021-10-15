import { AdminRedisSettingResult } from '@xrengine/common/src/interfaces/AdminRedisSettingResult'

export const AwsSettingAction = {
  awsSettingRetrieved: (adminRedisSettingResult: AdminRedisSettingResult) => {
    return {
      type: 'ADMIN_AWS_SETTING_FETCHED' as const,
      adminRedisSettingResult: adminRedisSettingResult
    }
  }
}

export type AwsSettingActionType = ReturnType<typeof AwsSettingAction[keyof typeof AwsSettingAction]>
