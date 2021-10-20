import { ClientSettingResult } from '@standardcreative/common/src/interfaces/ClientSettingResult'
export const ClientSettingAction = {
  fetchedClient: (clientSettingResult: ClientSettingResult) => {
    return {
      type: 'CLIENT_SETTING_DISPLAY' as const,
      clientSettingResult: clientSettingResult
    }
  }
}

export type ClientSettingActionType = ReturnType<typeof ClientSettingAction[keyof typeof ClientSettingAction]>
