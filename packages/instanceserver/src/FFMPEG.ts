import Process from 'child_process'
import ffmpeg from 'ffmpeg-static'

import serverLogger from '@etherealengine/server-core/src/ServerLogger'

const logger = serverLogger.child({ module: 'instanceserver:FFMPEG' })

/**
 * @todo
 *
 *  - support more codecs and get codec data from the producer directly
 * - support more than one ffmpeg at the same time by specifying different ports
 */

/**
 * Complete list of ffmpeg flags
 * https://gist.github.com/tayvano/6e2d456a9897f55025e25035478a3a50
 */

/**
 *
 * @param useAudio
 * @param useVideo
 * @param onExit
 * @param useH264
 * @returns
 */
export const startFFMPEG = async (useAudio: boolean, useVideo: boolean, onExit: () => void, useH264: boolean) => {
  // require on demand as not to unnecessary slow down instance server
  if (!ffmpeg) throw new Error('FFmpeg not found')

  let cmdInputPath = `${__dirname}/recording/input-vp8.sdp`
  let cmdOutputPath = `${__dirname}/recording/output-ffmpeg-vp8.webm`
  let cmdCodec = ''
  let cmdFormat = '-f webm -flags +global_header'

  // Ensure correct FFmpeg version is installed
  const ffmpegOut = Process.execSync(ffmpeg + ' -version', {
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
    throw new Error('FFmpeg >= 4.0.0 not found in $PATH; please install it')
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
    '-analyzeduration 3000000',
    '-fflags +genpts',
    `-i ${cmdInputPath}`,
    cmdCodec,
    cmdFormat,
    `-y ${cmdOutputPath}`
  ]
    .join(' ')
    .trim()

  logger.info(`Run command: ${ffmpeg} ${cmdArgStr}`)

  const childProcess = Process.spawn(ffmpeg, cmdArgStr.split(/\s+/))

  childProcess.on('error', (err) => {
    logger.error('Recording process error:', err)
  })

  childProcess.on('exit', (code, signal) => {
    logger.info('Recording process exit, code: %d, signal: %s', code, signal)

    onExit()

    if (!signal || signal === 'SIGINT') {
      logger.info('Recording stopped')
    } else {
      logger.warn("Recording process didn't exit cleanly, output file might be corrupt")
    }
  })

  const stop = () => {
    childProcess.kill('SIGINT')
  }
  childProcess.stdout.on('data', (chunk) => {
    console.log('chunk', chunk)
  })

  await new Promise<void>((resolve, reject) => {
    // FFmpeg writes its logs to stderr
    childProcess.stderr.on('data', (chunk) => {
      chunk
        .toString()
        .split(/\r?\n/g)
        .filter(Boolean) // Filter out empty strings
        .forEach((line) => {
          logger.info(line)
          if (line.startsWith('ffmpeg version')) {
            setTimeout(() => {
              resolve()
            }, 1000)
          }
        })
    })
  })

  return {
    childProcess,
    stop
  }
}

/**
 * 
/home/josh/Desktop/etherealengine/node_modules/ffmpeg-static/ffmpeg
 -nostdin
 -protocol_whitelist file,rtp,udp
 -analyzeduration 3000000
 -fflags +genpts
 -i /home/josh/Desktop/etherealengine/packages/instanceserver/src/recording/input-vp8.sdp 
 -map 0:v:0
 -c:v copy
 -f webm
 -flags +global_header
 -y /home/josh/Desktop/etherealengine/packages/instanceserver/src/recording/output-ffmpeg-vp8.webm

 */
