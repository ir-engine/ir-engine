import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { store } from '../../store'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

//State
export const state = createState({
  channelType: '',
  channelId: ''
})

store.receptors.push((action: TransportActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'CHANNEL_TYPE_CHANGED':
        s.channelType.set(action.channelType)
        return s.channelId.set(action.channelId)
    }
  }, action.type)
})

export const accessTransportStreamState = () => state
export const useTransportStreamState = () => useState(state)

//Service
export const TransportService = {
  updateChannelTypeState: () => {
    const ms = MediaStreams.instance
    return store.dispatch(TransportAction.setChannelTypeState((ms as any).channelType, (ms as any).channelId))
  }
}

//Action
export const TransportAction = {
  setChannelTypeState: (channelType: string, channelId: string) => ({
    type: 'CHANNEL_TYPE_CHANGED' as const,
    channelType,
    channelId
  })
}

export type TransportActionType = ReturnType<typeof TransportAction[keyof typeof TransportAction]>
