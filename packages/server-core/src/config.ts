/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import configFile from './appconfig'
import { SctpParameters } from './types/SctpParameters'

const NUM_RTC_PORTS = process.env.NUM_RTC_PORTS ? parseInt(process.env.NUM_RTC_PORTS) : 10000

export const sctpParameters: SctpParameters = {
  OS: 1024,
  MIS: 65535,
  maxMessageSize: 65535,
  port: 5000
}

export const config = {
  httpPeerStale: 15000,
  mediasoup: {
    webRtcServerOptions: {
      listenInfos: [
        {
          protocol: 'udp',
          ip: configFile.instanceserver.domain! || '0.0.0.0',
          announcedIp: null! as string,
          port: process.env.DEV_CHANNEL === 'true ' ? 30000 : 40000
        },
        {
          protocol: 'tcp',
          ip: configFile.instanceserver.domain! || '0.0.0.0',
          announcedIp: null! as string,
          port: process.env.DEV_CHANNEL === 'true' ? 30000 : 40000
        }
      ]
    },
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
    webRtcServerOptions: {
      listenInfos: [
        {
          protocol: 'udp',
          ip: configFile.instanceserver.domain! || '0.0.0.0',
          announcedIp: null! as string,
          port: process.env.DEV_CHANNEL === 'true' ? 30000 : configFile.instanceserver.rtcStartPrt
        },
        {
          protocol: 'tcp',
          ip: configFile.instanceserver.domain! || '0.0.0.0',
          announcedIp: null! as string,
          port: process.env.DEV_CHANNEL === 'true' ? 30000 : configFile.instanceserver.rtcStartPrt
        }
      ]
    },
    worker: {
      rtcMinPort: process.env.DEV_CHANNEL === 'true' ? 30000 : configFile.instanceserver.rtcStartPrt,
      rtcMaxPort:
        (process.env.DEV_CHANNEL === 'true' ? 30000 : configFile.instanceserver.rtcStartPrt) + NUM_RTC_PORTS - 1,
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
