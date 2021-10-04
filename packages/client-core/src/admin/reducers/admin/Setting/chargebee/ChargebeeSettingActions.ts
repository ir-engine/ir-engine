export const ChargebeeSettingAction = {
  fetchedChargebee: (chargebee: any) => {
    return {
      type: 'CHARGEBEE_SETTING_DISPLAY' as const,
      chargebee: chargebee
    }
  }
}

export type ChargebeeSettingActionType = ReturnType<typeof ChargebeeSettingAction[keyof typeof ChargebeeSettingAction]>
