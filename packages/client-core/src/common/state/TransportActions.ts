export const TransportAction = {
  setChannelTypeState: (channelType: string, channelId: string) => ({
    type: 'CHANNEL_TYPE_CHANGED' as const,
    channelType,
    channelId
  })
}

export type TransportActionType = ReturnType<typeof TransportAction[keyof typeof TransportAction]>
