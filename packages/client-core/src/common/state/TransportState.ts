import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { TransportActionType } from './TransportActions'

export const state = createState({
  channelType: '',
  channelId: ''
})

export function receptor(action: TransportActionType): any {
  state.batch((s) => {
    switch (action.type) {
      case 'CHANNEL_TYPE_CHANGED':
        s.channelType.set(action.channelType)
        return s.channelId.set(action.channelId)
    }
  }, action.type)
}

export const accessTransportStreamState = () => state
export const useTransportStreamState = () => useState(state)
