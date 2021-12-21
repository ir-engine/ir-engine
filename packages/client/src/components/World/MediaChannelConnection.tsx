import React, { useEffect, useState } from 'react'

import { leave, endVideoChat } from '@xrengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { TransportService } from '@xrengine/client-core/src/common/services/TransportService'
import { MediaStreamService } from '@xrengine/client-core/src/media/services/MediaStreamService'
import { ChannelConnectionService } from '@xrengine/client-core/src/common/services/ChannelConnectionService'
import { useChannelConnectionState } from '@xrengine/client-core/src/common/services/ChannelConnectionService'

const initialRefreshModalValues = {
  open: false,
  title: '',
  body: '',
  action: async () => {},
  parameters: [],
  timeout: 10000,
  closeAction: async () => {}
}

const MediaChannelConnection = () => {
  const channelConnectionState = useChannelConnectionState()
  const [warningRefreshModalValues, setWarningRefreshModalValues] = useState(initialRefreshModalValues)

  useEffect(() => {
    TransportService.updateChannelTypeState()
  }, [MediaStreams.instance.channelType, MediaStreams.instance.channelId])

  useEffect(() => {
    if (channelConnectionState.channelDisconnected.value === true) {
      const newValues = {
        ...warningRefreshModalValues,
        open: true,
        title: 'Call disconnected',
        body: "You've lost your connection to this call. We'll try to reconnect before the following time runs out, otherwise you'll hang up",
        action: async () => endCall(),
        parameters: [],
        timeout: 30000,
        closeAction: endCall
      }
      setWarningRefreshModalValues(newValues)
    }
  }, [channelConnectionState.channelDisconnected.value])

  const endCall = async () => {
    TransportService.updateChannelTypeState()
    await endVideoChat({})
    await leave(false)
    MediaStreams.instance.channelType = null!
    MediaStreams.instance.channelId = null!
    MediaStreamService.updateCamVideoState()
    MediaStreamService.updateCamAudioState()
  }

  useEffect(() => {
    if (
      channelConnectionState.instanceProvisioned.value === true &&
      channelConnectionState.updateNeeded.value === true &&
      channelConnectionState.instanceServerConnecting.value === false &&
      channelConnectionState.connected.value === false
    ) {
      ChannelConnectionService.connectToChannelServer(channelConnectionState.channelId.value, true)
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
