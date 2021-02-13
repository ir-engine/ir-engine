import { SctpCapabilities } from "mediasoup-client/lib/types";

export type WebRtcTransportParams = {
  peerId?: string;
  direction: 'recv' | 'send';
  sctpCapabilities: SctpCapabilities;
  channelType: string;
  channelId?: string;
}