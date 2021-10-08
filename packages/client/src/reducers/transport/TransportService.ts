import { Dispatch } from 'redux'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { TransportAction } from './TransportActions'
import Store from '@xrengine/client-core/src/store'

const store = Store.store

export const TransportService = {
  updateChannelTypeState: () => {
    const ms = MediaStreams.instance
    return store.dispatch(TransportAction.setChannelTypeState((ms as any).channelType, (ms as any).channelId))
  }
}
