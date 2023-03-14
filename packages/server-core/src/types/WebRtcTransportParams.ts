import { ChannelType } from '@etherealengine/common/src/interfaces/Channel'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'

// Types borrowed from Mediasoup

type NumSctpStreams = {
  /**
   * Initially requested number of outgoing SCTP streams.
   */
  OS: number
  /**
   * Maximum number of incoming SCTP streams.
   */
  MIS: number
}
type SctpCapabilities = {
  numStreams: NumSctpStreams
}
export type WebRtcTransportParams = {
  peerID?: PeerID
  direction: 'recv' | 'send'
  sctpCapabilities: SctpCapabilities
  channelType: ChannelType
  channelId?: string
}
