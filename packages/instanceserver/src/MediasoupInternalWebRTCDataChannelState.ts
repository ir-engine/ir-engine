import { DataChannelType } from '@etherealengine/common/src/interfaces/DataChannelType'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { defineState } from '@etherealengine/hyperflux'
import { DataConsumer } from 'mediasoup/node/lib/DataConsumer'

export const MediasoupInternalWebRTCDataChannelState = defineState({
  name: 'ee.instanceserver.mediasoup.MediasoupInternalWebRTCDataChannelState',

  initial: {} as Record<
    PeerID,
    {
      incomingDataConsumers: Record<DataChannelType, DataConsumer>
      outgoingDataConsumers: Record<DataChannelType, DataConsumer>
    }
  >
})
