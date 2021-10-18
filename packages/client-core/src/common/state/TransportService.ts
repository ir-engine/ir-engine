import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { TransportAction } from './TransportActions'
import { store } from '../../store'

export const TransportService = {
  updateChannelTypeState: () => {
    const ms = MediaStreams.instance
    return store.dispatch(TransportAction.setChannelTypeState((ms as any).channelType, (ms as any).channelId))
  }
}
