import { createState, useState, none, Downgraded } from '@hookstate/core'
import { TransportActionType } from './TransportActions'

export const state = createState({
  channelType: '',
  channelId: ''
})

export const transportReducer = (_, action: TransportActionType) => {
  Promise.resolve().then(() => transportReceptor(action))
  return state.attach(Downgraded).value
}

export default function transportReceptor(action: TransportActionType): any {
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
