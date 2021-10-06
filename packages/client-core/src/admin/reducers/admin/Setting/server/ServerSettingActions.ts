export const ServerSettingAction = {
  fetchedSeverInfo: (serverInfo: any) => {
    return {
      type: 'SETTING_SERVER_DISPLAY' as const,
      serverInfo: serverInfo
    }
  }
}
export type ServerSettingActionType = ReturnType<typeof ServerSettingAction[keyof typeof ServerSettingAction]>
