import { ChargebeeSettingResult } from '@xrengine/common/src/interfaces/ChargebeeSettingResult'

export const ChargebeeSettingAction = {
  fetchedChargebee: (chargebeeSettingResult: ChargebeeSettingResult) => {
    return {
      type: 'CHARGEBEE_SETTING_DISPLAY' as const,
      chargebeeSettingResult: chargebeeSettingResult
    }
  }
}

export type ChargebeeSettingActionType = ReturnType<typeof ChargebeeSettingAction[keyof typeof ChargebeeSettingAction]>
