export const AuthSettingAction = {
  authSettingRetrieved: (data: any) => {
    return {
      type: 'ADMIN_AUTH_SETTING_FETCHED' as const,
      list: data
    }
  },
  authSettingPatched: (data: any) => {
    return {
      type: 'ADMIN_AUTH_SETTING_PATCHED' as const
    }
  }
}

export type AuthSettingActionType = ReturnType<typeof AuthSettingAction[keyof typeof AuthSettingAction]>
