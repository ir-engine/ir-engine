import Process from 'child_process'
import FFmpegStatic from 'ffmpeg-static'

import { localConfig } from '@etherealengine/server-core/src/config'

import { startWebRTC } from './WebRTCFunctions'
import { handleWebRtcCloseConsumer, handleWebRtcTransportClose } from './WebRTCFunctions'

const Config = localConfig
const { routers } = await startWebRTC()

const global = {
  mediasoup: {
    worker: null,
    router: null,

    // WebRTC connection with the browser
    webrtc: {
      recvTransport: null,
      audioProducer: {
        id: null
      },
      videoProducer: {
        id: null
      }
    },

    // RTP connection with recording process
    rtp: {
      audioTransport: null,
      audioConsumer: null,
      videoTransport: null,
      videoConsumer: null
    }
  },

  recProcess: null
}

function audioEnabled() {
  return global.mediasoup.webrtc.audioProducer !== null
}

function videoEnabled() {
  return global.mediasoup.webrtc.videoProducer !== null
}

function h264Enabled() {
  const codec = Config.mediasoup.router.mediaCodecs.find((c: { mimeType: string }) => c.mimeType === 'video/H264')
  return codec !== undefined
}

async function MediasoupTransport(recorder: any): Promise<void> {
  const router = routers

  const useAudio = audioEnabled()
  const useVideo = videoEnabled()

  // Start mediasoup's RTP consumer(s)

  if (useAudio) {
    const rtpTransport = await router.createPlainTransport({
      // No RTP will be received from the remote side
      comedia: false,

      // FFmpeg don't support RTP/RTCP multiplexing ("a=rtcp-mux" in SDP)
      rtcpMux: false,

      ...Config.mediasoup.plainTransport
    })
    global.mediasoup.rtp.audioTransport = rtpTransport

    await rtpTransport.connect({
      ip: Config.mediasoup.recording.ip,
      port: Config.mediasoup.recording.audioPort,
      rtcpPort: Config.mediasoup.recording.audioPortRtcp
    })

    console.log(
      'mediasoup AUDIO RTP SEND transport connected: %s:%d <--> %s:%d (%s)',
      rtpTransport.tuple.localIp,
      rtpTransport.tuple.localPort,
      rtpTransport.tuple.remoteIp,
      rtpTransport.tuple.remotePort,
      rtpTransport.tuple.protocol
    )

    console.log(
      'mediasoup AUDIO RTCP SEND transport connected: %s:%d <--> %s:%d (%s)',
      rtpTransport.rtcpTuple.localIp,
      rtpTransport.rtcpTuple.localPort,
      rtpTransport.rtcpTuple.remoteIp,
      rtpTransport.rtcpTuple.remotePort,
      rtpTransport.rtcpTuple.protocol
    )

    const rtpConsumer = await rtpTransport.consume({
      producerId: global.mediasoup.webrtc.audioProducer.id,
      rtpCapabilities: router.rtpCapabilities, // Assume the recorder supports same formats as mediasoup's router
      paused: true
    })
    global.mediasoup.rtp.audioConsumer = rtpConsumer

    console.log(
      'mediasoup AUDIO RTP SEND consumer created, kind: %s, type: %s, paused: %s, SSRC: %s CNAME: %s',
      rtpConsumer.kind,
      rtpConsumer.type,
      rtpConsumer.paused,
      rtpConsumer.rtpParameters.encodings[0].ssrc,
      rtpConsumer.rtpParameters.rtcp.cname
    )
  }

  if (useVideo) {
    const rtpTransport = await router.createPlainTransport({
      // No RTP will be received from the remote side
      comedia: false,

      // FFmpeg don't support RTP/RTCP multiplexing ("a=rtcp-mux" in SDP)
      rtcpMux: false,

      ...Config.mediasoup.plainTransport
    })
    global.mediasoup.rtp.videoTransport = rtpTransport

    await rtpTransport.connect({
      ip: Config.mediasoup.recording.ip,
      port: Config.mediasoup.recording.videoPort,
      rtcpPort: Config.mediasoup.recording.videoPortRtcp
    })

    console.log(
      'mediasoup VIDEO RTP SEND transport connected: %s:%d <--> %s:%d (%s)',
      rtpTransport.tuple.localIp,
      rtpTransport.tuple.localPort,
      rtpTransport.tuple.remoteIp,
      rtpTransport.tuple.remotePort,
      rtpTransport.tuple.protocol
    )

    console.log(
      'mediasoup VIDEO RTCP SEND transport connected: %s:%d <--> %s:%d (%s)',
      rtpTransport.rtcpTuple.localIp,
      rtpTransport.rtcpTuple.localPort,
      rtpTransport.rtcpTuple.remoteIp,
      rtpTransport.rtcpTuple.remotePort,
      rtpTransport.rtcpTuple.protocol
    )

    const rtpConsumer = await rtpTransport.consume({
      producerId: global.mediasoup.webrtc.videoProducer.id,
      rtpCapabilities: router.rtpCapabilities, // Assume the recorder supports same formats as mediasoup's router
      paused: true
    })
    global.mediasoup.rtp.videoConsumer = rtpConsumer

    console.log(
      'mediasoup VIDEO RTP SEND consumer created, kind: %s, type: %s, paused: %s, SSRC: %s CNAME: %s',
      rtpConsumer.kind,
      rtpConsumer.type,
      rtpConsumer.paused,
      rtpConsumer.rtpParameters.encodings[0].ssrc,
      rtpConsumer.rtpParameters.rtcp.cname
    )
  }

  switch (recorder) {
    case 'ffmpeg':
      await startRecordingFfmpeg()
      break
    default:
      console.warn('Invalid recorder:', recorder)
      break
  }

  if (useAudio) {
    const consumer: any = global.mediasoup.rtp.audioConsumer
    console.log('Resume mediasoup RTP consumer, kind: %s, type: %s', consumer.kind, consumer.type)
    consumer.resume()
  }
  if (useVideo) {
    const consumer: any = global.mediasoup.rtp.videoConsumer
    console.log('Resume mediasoup RTP consumer, kind: %s, type: %s', consumer.kind, consumer.type)
    consumer.resume()
  }
}

// ----

/* FFmpeg recording
 * ================
 */
function startRecordingFfmpeg() {
  // Return a Promise that can be awaited
  let recResolve
  const promise = new Promise((res, _rej) => {
    recResolve = res
  })

  const useAudio = audioEnabled()
  const useVideo = videoEnabled()
  const useH264 = h264Enabled()

  // const cmdProgram = "ffmpeg"; // Found through $PATH
  const cmdProgram: any = FFmpegStatic // From package "ffmpeg-static"

  let cmdInputPath = `${__dirname}/recording/input-vp8.sdp`
  let cmdOutputPath = `${__dirname}/recording/output-ffmpeg-vp8.webm`
  let cmdCodec = ''
  let cmdFormat = '-f webm -flags +global_header'

  // Ensure correct FFmpeg version is installed
  const ffmpegOut = Process.execSync(cmdProgram + ' -version', {
    encoding: 'utf8'
  })
  const ffmpegVerMatch = /ffmpeg version (\d+)\.(\d+)\.(\d+)/.exec(ffmpegOut)
  let ffmpegOk = false
  if (ffmpegOut.startsWith('ffmpeg version git')) {
    // Accept any Git build (it's up to the developer to ensure that a recent
    // enough version of the FFmpeg source code has been built)
    ffmpegOk = true
  } else if (ffmpegVerMatch) {
    const ffmpegVerMajor = parseInt(ffmpegVerMatch[1], 10)
    if (ffmpegVerMajor >= 4) {
      ffmpegOk = true
    }
  }

  if (!ffmpegOk) {
    console.error('FFmpeg >= 4.0.0 not found in $PATH; please install it')
    process.exit(1)
  }

  if (useAudio) {
    cmdCodec += ' -map 0:a:0 -c:a copy'
  }
  if (useVideo) {
    cmdCodec += ' -map 0:v:0 -c:v copy'

    if (useH264) {
      cmdInputPath = `${__dirname}/recording/input-h264.sdp`
      cmdOutputPath = `${__dirname}/recording/output-ffmpeg-h264.mp4`

      // "-strict experimental" is required to allow storing
      // OPUS audio into MP4 container
      cmdFormat = '-f mp4 -strict experimental'
    }
  }

  // Run process
  const cmdArgStr = [
    '-nostdin',
    '-protocol_whitelist file,rtp,udp',
    '-fflags +genpts',
    `-i ${cmdInputPath}`,
    cmdCodec,
    cmdFormat,
    `-y ${cmdOutputPath}`
  ]
    .join(' ')
    .trim()

  console.log(`Run command: ${cmdProgram} ${cmdArgStr}`)

  let recProcess: any = Process.spawn(cmdProgram, cmdArgStr.split(/\s+/))
  global.recProcess = recProcess

  recProcess.on('error', (err) => {
    console.error('Recording process error:', err)
  })

  recProcess.on('exit', (code, signal) => {
    console.log('Recording process exit, code: %d, signal: %s', code, signal)

    global.recProcess = null
    stopMediasoupRtp()

    if (!signal || signal === 'SIGINT') {
      console.log('Recording stopped')
    } else {
      console.warn("Recording process didn't exit cleanly, output file might be corrupt")
    }
  })

  // FFmpeg writes its logs to stderr
  recProcess.stderr.on('data', (chunk) => {
    chunk
      .toString()
      .split(/\r?\n/g)
      .filter(Boolean) // Filter out empty strings
      .forEach((line) => {
        console.log(line)
        if (line.startsWith('ffmpeg version')) {
          setTimeout(() => {
            recResolve()
          }, 1000)
        }
      })
  })

  return promise
}

async function stopMediasoupRtp() {
  console.log('Stop mediasoup RTP transport and consumer')

  const useAudio = audioEnabled()
  const useVideo = videoEnabled()

  if (useAudio) {
    await handleWebRtcCloseConsumer()
    await handleWebRtcTransportClose
  }

  if (useVideo) {
    handleWebRtcCloseConsumer
    handleWebRtcTransportClose
  }
}

export {}
