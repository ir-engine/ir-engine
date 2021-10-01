import { Dispatch } from 'redux'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { setChannelTypeState } from './actions'
import Store from '@xrengine/client-core/src/store'

const store = Store.store

export const updateChannelTypeState = () => {
  const ms = MediaStreams.instance
  if (!ms) changeChannelTypeState('', '')

  return store.dispatch(setChannelTypeState((ms as any).channelType, (ms as any).channelId))
}

export const changeChannelTypeState = (channelType: string, channelId: string) => {
  return (dispatch: Dispatch): void => {
    dispatch(setChannelTypeState(channelType, channelId))
  }
}
