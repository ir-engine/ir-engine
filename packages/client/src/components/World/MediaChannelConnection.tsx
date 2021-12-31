import React, { useEffect } from 'react'

import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { TransportService } from '@xrengine/client-core/src/common/services/TransportService'
import { MediaStreamService } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { ChannelConnectionService } from '@xrengine/client-core/src/common/services/ChannelConnectionService'
import { useChannelConnectionState } from '@xrengine/client-core/src/common/services/ChannelConnectionService'

const MediaChannelConnection = () => {
  const channelConnectionState = useChannelConnectionState()

  useEffect(() => {
    TransportService.updateChannelTypeState()
  }, [MediaStreams.instance.channelType, MediaStreams.instance.channelId])

  useEffect(() => {
    if (
      channelConnectionState.instanceProvisioned.value === true &&
      channelConnectionState.updateNeeded.value === true &&
      channelConnectionState.instanceServerConnecting.value === false &&
      channelConnectionState.connected.value === false
    ) {
      ChannelConnectionService.connectToChannelServer(channelConnectionState.channelId.value)
      MediaStreamService.updateCamVideoState()
      MediaStreamService.updateCamAudioState()
    }
  }, [
    channelConnectionState.connected,
    channelConnectionState.updateNeeded,
    channelConnectionState.instanceProvisioned,
    channelConnectionState.instanceServerConnecting
  ])

  return <></>
}

export default MediaChannelConnection
