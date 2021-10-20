import { EmailSettingResult } from '@standardcreative/common/src/interfaces/EmailSettingResult'

export const EmailSettingAction = {
  fetchedEmail: (emailSettingResult: EmailSettingResult) => {
    return {
      type: 'EMAIL_SETTING_DISPLAY' as const,
      emailSettingResult: emailSettingResult
    }
  }
}

export type EmailSettingActionType = ReturnType<typeof EmailSettingAction[keyof typeof EmailSettingAction]>
