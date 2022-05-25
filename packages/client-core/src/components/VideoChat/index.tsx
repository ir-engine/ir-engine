import * as React from 'react'

import {
  configureMediaTransports,
  endVideoChat
} from '@xrengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { SocketWebRTCClientNetwork } from '@xrengine/client-core/src/transports/SocketWebRTCClientNetwork'
import multiLogger from '@xrengine/common/src/logger'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'

import { CallEnd, VideoCall } from '@mui/icons-material'
import Fab from '@mui/material/Fab'

const logger = multiLogger.child({ component: 'client-core:videochat' })

interface Props {}

const VideoChat = (props: Props) => {
  const mediaStreamSystem = new MediaStreams()

  const gsProvision = async () => {
    if (mediaStreamSystem.videoStream == null) {
      const mediaTransport = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
      await configureMediaTransports(mediaTransport, ['video', 'audio'])
      logger.info('Send camera streams called from gsProvision.')
    } else {
      await endVideoChat(null, {})
    }
  }
  return (
    <Fab color="primary" aria-label="VideoChat" onClick={gsProvision}>
      {mediaStreamSystem.videoStream == null && <VideoCall />}
      {mediaStreamSystem.videoStream != null && <CallEnd />}
    </Fab>
  )
}

export default VideoChat
