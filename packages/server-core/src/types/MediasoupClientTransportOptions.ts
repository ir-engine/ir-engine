import { DtlsParameters, IceCandidate, IceParameters, SctpParameters } from 'mediasoup/node/lib/types'

export type MediasoupClientTransportOptions = {
  id: string
  iceParameters: IceParameters
  iceCandidates: IceCandidate[]
  dtlsParameters: DtlsParameters
  sctpParameters?: SctpParameters
  iceServers?: RTCIceServer[]
  iceTransportPolicy?: RTCIceTransportPolicy
  additionalSettings?: any
  proprietaryConstraints?: any
  appData?: any
}
