import Immutable from 'immutable'
import { CHANNEL_TYPE_CHANGED } from '../actions'
import { ChannelTypeAction } from './actions'

export const initialTransportState = {
  channelType: '',
  channelId: ''
}

const immutableState = Immutable.fromJS(initialTransportState) as any

export default function transportReducer(state = immutableState, action: any): any {
  switch (action.type) {
    case CHANNEL_TYPE_CHANGED:
      return state
        .set('channelType', (action as ChannelTypeAction).channelType)
        .set('channelId', (action as ChannelTypeAction).channelId)
  }

  return state
}
