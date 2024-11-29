import { NetworkID, PeerID } from '@ir-engine/hyperflux'
import { MessageTypes } from '../src/webrtc/WebRTCTransportFunctions'

export type PeerMessage = { networkID: NetworkID; toPeerID: PeerID; message: MessageTypes }
