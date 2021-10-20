import { ServerSettingResult } from '@standardcreative/common/src/interfaces/ServerSettingResult'

export const ServerSettingAction = {
  fetchedSeverInfo: (serverSettingResult: ServerSettingResult) => {
    return {
      type: 'SETTING_SERVER_DISPLAY' as const,
      serverSettingResult: serverSettingResult
    }
  }
}
export type ServerSettingActionType = ReturnType<typeof ServerSettingAction[keyof typeof ServerSettingAction]>
