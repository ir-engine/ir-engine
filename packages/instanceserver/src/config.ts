export default {
  // https: {
  //   cert: "../../../certs/cert.pem", //pem files are from the etherealengine certs folder
  //   certKey: "../../../certs/key.pem",
  //   port: 8080,
  //   wsPath: "/server",
  //   wsPingInterval: 25000,
  //   wsPingTimeout: 5000,
  // },

  mediasoup: {
    // WorkerSettings
    worker: {
      logLevel: 'debug',
      logTags: ['dtls', 'ice', 'info', 'rtcp', 'rtp', 'srtp'],
      rtcMinPort: 32256,
      rtcMaxPort: 65535
    },

    router: {
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          preferredPayloadType: 111,
          clockRate: 48000,
          channels: 2,
          parameters: {
            minptime: 10,
            useinbandfec: 1
          }
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          preferredPayloadType: 96,
          clockRate: 90000
        },
        {
          kind: 'video',
          mimeType: 'video/H264',
          preferredPayloadType: 125,
          clockRate: 90000,
          parameters: {
            'level-asymmetry-allowed': 1,
            'packetization-mode': 1,
            'profile-level-id': '42e01f'
          }
        }
      ]
    },

    // WebRtcTransportOptions
    webrtcTransport: {
      listenIps: [{ ip: '127.0.0.1:3030', announcedIp: null }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate: 300000
    },

    // PlainTransportOptions
    plainTransport: {
      listenIp: { ip: '127.0.0.1:3000', announcedIp: null }
    },

    client: {
      // ProducerOptions
      videoProducer: {
        // Sending video with 3 simulcast streams
        // RTCRtpEncodingParameters[]
        encodings: [
          {
            maxBitrate: 100000
            // maxFramerate: 15.0,
            // scaleResolutionDownBy: 1.5,
          },
          {
            maxBitrate: 300000
          },
          {
            maxBitrate: 900000
          }
        ],
        codecOptions: {
          videoGoogleStartBitrate: 1000
        }
      }
    },

    // Target IP and port for RTP recording
    recording: {
      ip: '127.0.0.1:3000',

      // FFmpeg's sdpdemux only supports RTCP = RTP + 1
      audioPort: 5004,
      audioPortRtcp: 5005,
      videoPort: 5006,
      videoPortRtcp: 5007
    }
  }
}
