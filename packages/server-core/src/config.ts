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

import { VideoConstants } from '@etherealengine/network'

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
        VideoConstants.OPUS_STEREO_CODEC,
        VideoConstants.VP9_CODEC,
        VideoConstants.VP8_CODEC,
        VideoConstants.H264_CODEC
      ]
    },

    // rtp listenIps are the most important thing, below. you'll need
    // to set these appropriately for your network for the demo to
    // run anywhere but on 127.0.0.1
    webRtcTransport: {
      listenIps: [{ ip: null! as string, announcedIp: null! as string }],
      initialAvailableOutgoingBitrate: 10 * 1000 * 1000, //1gbps
      maxIncomingBitrate: 30 * 1000 * 1000 // 30mbps - this should be set to something; leaving it uncapped causes stuttering
    },

    plainTransport: {
      listenIp: { ip: null! as string, announcedIp: null! as string }
    },

    recording: {
      // the internal IP of the local machine, not the public one - overridden upon instance server startup
      ip: null! as string
    }
  }
}
