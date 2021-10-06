export const AwsSettingAction = {
  awsSettingRetrieved: (data: any) => {
    return {
      type: 'ADMIN_AWS_SETTING_FETCHED' as const,
      list: data
    }
  }
}

export type AwsSettingActionType = ReturnType<typeof AwsSettingAction[keyof typeof AwsSettingAction]>
