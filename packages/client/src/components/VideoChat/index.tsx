import * as React from 'react'

import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import {
  configureMediaTransports,
  endVideoChat
} from '@xrengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'

import { CallEnd, VideoCall } from '@mui/icons-material'
import Fab from '@mui/material/Fab'

interface Props {}

const VideoChat = (props: Props) => {
  const mediaStreamSystem = new MediaStreams()

  const user = useAuthState().user
  const currentLocation = useLocationState().currentLocation.location
  const gsProvision = async () => {
    if (mediaStreamSystem.videoStream == null) {
      await configureMediaTransports(
        ['video', 'audio'],
        currentLocation?.locationSettings?.instanceMediaChatEnabled?.value === true ? 'instance' : user.partyId.value
      )
      console.log('Send camera streams called from gsProvision')
    } else {
      await endVideoChat({})
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
