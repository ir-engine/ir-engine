import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { DataChannelType } from '@etherealengine/engine/src/networking/classes/Network'

// todo - refactor to be in a reactor such that we can record media tracks that are started after the recording is

export const startMediaRecording = (recordingID: string, userID: UserId, mediaChannels: DataChannelType[]) => {
  const network = Engine.instance.mediaNetwork

  const peers = network.users.get(userID)

  if (!peers) return

  const mediaStreams = {} as Record<PeerID, { video?: string; audio?: string }>

  for (const peerID of peers) {
    console.log(peerID)

    const peer = network.peers.get(peerID)!

    const peerMedia = Object.entries(peer.media!).filter(([type]) => mediaChannels.includes(type as DataChannelType))

    if (peerMedia.length) {
      for (const [type, media] of peerMedia) {
        if (!mediaStreams[peerID]) mediaStreams[peerID] = {}
        mediaStreams[peerID][type] = media
        console.log(media)
      }
    }
  }

  console.log({ mediaStreams })
}
