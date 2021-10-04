export const EmailSettingAction = {
  fetchedEmail: (email: any) => {
    return {
      type: 'EMAIL_SETTING_DISPLAY' as const,
      email: email
    }
  }
}

export type EmailSettingActionType = ReturnType<typeof EmailSettingAction[keyof typeof EmailSettingAction]>
