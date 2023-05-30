import type { TransportListenIp } from 'mediasoup/node/lib/Transport'
import type { WebRtcTransportOptions } from 'mediasoup/node/lib/WebRtcTransport'

import configFile from './appconfig'
import { SctpParameters } from './types/SctpParameters'

export const sctpParameters: SctpParameters = {
  OS: 1024,
  MIS: 65535,
  maxMessageSize: 65535,
  port: 5000
}

export const config = {
  httpPeerStale: 15000,
  mediasoup: {
    worker: {
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
      logLevel: 'info',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
    },
    router: {
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          parameters: {
            //                'x-google-start-bitrate': 1000
          }
        },
        {
          kind: 'video',
          mimeType: 'video/h264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '4d0032',
            'level-asymmetry-allowed': 1
          }
        },
        {
          kind: 'video',
          mimeType: 'video/h264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f',
            'level-asymmetry-allowed': 1
          }
        }
      ]
    },

    // rtp listenIps are the most important thing, below. you'll need
    // to set these appropriately for your network for the demo to
    // run anywhere but on 127.0.0.1
    webRtcTransport: {
      listenIps: [{ ip: configFile.instanceserver.domain, announcedIp: null! as string }],
      initialAvailableOutgoingBitrate: 1000 * 1000 * 1000, //1gbps
      maxIncomingBitrate: 30 * 1000 * 1000 // 30mbps - this should be set to something; leaving it uncapped causes stuttering
    }
  }
}

export const localConfig = {
  httpPeerStale: 15000,
  mediasoup: {
    worker: {
      rtcMinPort: configFile.instanceserver.rtc_start_port,
      rtcMaxPort: configFile.instanceserver.rtc_end_port,
      logLevel: 'info',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
    },
    router: {
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          preferredPayloadType: 96,
          clockRate: 90000,
          parameters: {
            //'x-google-start-bitrate': 1000
          }
        },
        {
          kind: 'video',
          mimeType: 'video/h264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '4d0032',
            'level-asymmetry-allowed': 1
          }
        },
        {
          kind: 'video',
          mimeType: 'video/h264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f',
            'level-asymmetry-allowed': 1
          }
        }
      ]
    },

    // rtp listenIps are the most important thing, below. you'll need
    // to set these appropriately for your network for the demo to
    // run anywhere but on 127.0.0.1
    webRtcTransport: {
      listenIps: [{ ip: null! as string, announcedIp: null! as string }],
      initialAvailableOutgoingBitrate: 1000 * 1000 * 1000, //1gbps
      maxIncomingBitrate: 30 * 1000 * 1000 // 30mbps - this should be set to something; leaving it uncapped causes stuttering
    },

    plainTransport: {
      listenIp: { ip: null! as string, announcedIp: null! as string }
    },

    recording: {
      // the internal IP of the local machine, not the public one - overridden upon instance server startup
      ip: null! as string,
      // FFmpeg's sdpdemux only supports RTCP = RTP + 1
      audioPort: 5004,
      audioPortRtcp: 5005,
      videoPort: 5006,
      videoPortRtcp: 5007
    }
  }
}
