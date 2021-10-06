export const ClientSettingAction = {
  fetchedClient: (client: any) => {
    return {
      type: 'CLIENT_SETTING_DISPLAY' as const,
      client: client
    }
  }
}

export type ClientSettingActionType = ReturnType<typeof ClientSettingAction[keyof typeof ClientSettingAction]>
