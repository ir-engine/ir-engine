import { ChannelType } from '@xrengine/common/src/interfaces/Channel'

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
  peerId?: string
  direction: 'recv' | 'send'
  sctpCapabilities: SctpCapabilities
  channelType: ChannelType
  channelId?: string
}
