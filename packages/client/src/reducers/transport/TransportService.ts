import { Dispatch } from 'redux'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { TransportAction } from './TransportActions'
import Store from '@xrengine/client-core/src/store'

const store = Store.store

export const TransportService = {
  updateChannelTypeState: () => {
    const ms = MediaStreams.instance
    if (!ms) TransportService.changeChannelTypeState('', '')
    return store.dispatch(TransportAction.setChannelTypeState((ms as any).channelType, (ms as any).channelId))
  },
  changeChannelTypeState: (channelType: string, channelId: string) => {
    return (dispatch: Dispatch): void => {
      dispatch(TransportAction.setChannelTypeState(channelType, channelId))
    }
  }
}
