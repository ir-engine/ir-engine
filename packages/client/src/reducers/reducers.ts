import { channelConnectionReducer } from './channelConnection/ChannelConnectionState'
import { instanceConnectionReducer } from './instanceConnection/InstanceConnectionState'
import { mediaStreamReducer } from './mediastream/MediaStreamState'
import transportReducer from './transport/reducers'

export default {
  mediastream: mediaStreamReducer,
  channelConnection: channelConnectionReducer,
  instanceConnection: instanceConnectionReducer,
  transport: transportReducer
}
