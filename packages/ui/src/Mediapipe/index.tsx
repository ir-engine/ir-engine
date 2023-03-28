import { useHookstate } from '@hookstate/core'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { NormalizedLandmarkList, Pose, POSE_CONNECTIONS, ResultsListener } from '@mediapipe/pose'
import { t } from 'i18next'
import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

import { useMediaInstance } from '@etherealengine/client-core/src/common/services/MediaInstanceConnectionService'
import {
  RecordingFunctions,
  RecordingState,
  RecordingStateReceptorSystem
} from '@etherealengine/client-core/src/recording/RecordingService'
import { MediaStreamState } from '@etherealengine/client-core/src/transports/MediaStreams'
import {
  closeDataProducer,
  SocketWebRTCClientNetwork,
  toggleWebcamPaused
} from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { ECSRecordingFunctions } from '@etherealengine/engine/src/ecs/ECSRecording'
import { useSystems } from '@etherealengine/engine/src/ecs/functions/useSystems'
import { mocapDataChannelType, MotionCaptureFunctions } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { getMutableState, getState } from '@etherealengine/hyperflux'

import LoadingCircle from '../primitives/tailwind/LoadingCircle'

let creatingProducer = false
const startDataProducer = async () => {
  const network = Engine.instance.worldNetwork as SocketWebRTCClientNetwork
  if (!network?.sendTransport || creatingProducer) return
  creatingProducer = true
  const dataProducer = await network.sendTransport.produceData({
    appData: { data: {} },
    ordered: true,
    label: mocapDataChannelType,
    maxPacketLifeTime: 3000,
    // maxRetransmits: 3,
    protocol: 'raw'
  })
  dataProducer.on('transportclose', () => {
    network.dataProducers.delete(mocapDataChannelType)
  })
  network.dataProducers.set(mocapDataChannelType, dataProducer)
}

/**
 * Start playback of a recording
 * - If we are streaming data, close the data producer
 */
const startPlayback = async (recordingID: string, twin: boolean) => {
  const network = Engine.instance.worldNetwork as SocketWebRTCClientNetwork
  if (getState(RecordingState).playback && network.dataProducers.has(mocapDataChannelType)) {
    await closeDataProducer(network, mocapDataChannelType)
  }
  //*** TEMP VARIABLE - PUT IN UI */
  ECSRecordingFunctions.startPlayback({
    recordingID,
    targetUser: twin ? undefined : Engine.instance.userId
  })
}

const sendResults = (results: NormalizedLandmarkList) => {
  const network = Engine.instance.worldNetwork as SocketWebRTCClientNetwork
  if (!network?.sendTransport) return
  const dataProducer = network.dataProducers.get(mocapDataChannelType)
  if (!dataProducer) {
    startDataProducer()
    return
  }
  if (!dataProducer.closed && dataProducer.readyState === 'open') {
    const data = MotionCaptureFunctions.sendResults(results)
    dataProducer.send(data)
  }
}

const MotionCaptureReceptorSystemInjection = {
  uuid: 'ee.client.MotionCaptureReceptorSystem',
  type: 'POST_RENDER',
  systemLoader: () => Promise.resolve({ default: RecordingStateReceptorSystem })
} as const

const Mediapipe = () => {
  const canvasRef = useRef(null as any)
  const canvasCtxRef = useRef(null as any)
  const videoRef = useRef(null as HTMLVideoElement | null)
  const videoStream = useHookstate(getMutableState(MediaStreamState).videoStream)
  const mediaConnection = useMediaInstance()
  const recordingState = useHookstate(getMutableState(RecordingState))
  const modelLoaded = useHookstate(false)
  const isTwin = useHookstate(false)

  const ready = !!modelLoaded.value && !!mediaConnection?.value

  // todo include a mechanism to confirm that the recording has started/stopped
  const onToggleRecording = () => {
    if (recordingState.recordingID.value) {
      ECSRecordingFunctions.stopRecording({
        recordingID: recordingState.recordingID.value
      })
      RecordingFunctions.getRecordings()
    } else if (!recordingState.started.value) {
      RecordingFunctions.startRecording().then((recordingID) => {
        if (recordingID) ECSRecordingFunctions.startRecording({ recordingID })
      })
    }
  }

  useSystems([MotionCaptureReceptorSystemInjection])

  const mediapipe = useHookstate(null as Pose | null)

  const videoActive = useHookstate(false)

  const onResults: ResultsListener = useCallback(
    (results) => {
      // todo, when playing back, we should be displaying the playback data instead of live data
      if (recordingState.playback.value) return
      if (canvasCtxRef.current !== null && canvasRef.current !== null) {
        const { poseWorldLandmarks, poseLandmarks } = results
        if (canvasCtxRef.current && poseLandmarks?.length) {
          if (!modelLoaded.value) modelLoaded.set(true)
          //draw!!!
          canvasCtxRef.current.save()
          canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          canvasCtxRef.current.globalCompositeOperation = 'source-over'
          drawConnectors(canvasCtxRef.current, [...poseLandmarks], POSE_CONNECTIONS, {
            color: '#fff' /*'#00FF00'*/,
            lineWidth: 4
          })
          drawLandmarks(canvasCtxRef.current, [...poseLandmarks], {
            color: '#fff' /*'#FF0000'*/,
            lineWidth: 2
          })
          canvasCtxRef.current.restore()

          sendResults(poseWorldLandmarks)
        }
      }
    },
    [canvasCtxRef]
  )

  useEffect(() => {
    const videoElement = videoRef.current
    if (videoElement && videoStream.value) {
      videoElement.srcObject = videoStream.value
      videoElement.onloadedmetadata = function (e) {
        if (videoElement.paused) videoElement.play()
      }
      videoElement.onplay = function (e) {
        videoActive.set(true)
        let processingData = false
        const onAnimationFrame = () => {
          if (!videoActive.value) {
            processingData = false
            return
          }
          canvasRef.current.width = videoElement.clientWidth
          canvasRef.current.height = videoElement.clientHeight
          if (!mediapipe.value || processingData) {
            videoElement.requestVideoFrameCallback(onAnimationFrame)
          } else {
            processingData = true
            // we have to wait for the current frame to be processed before we can send the next one
            mediapipe.value?.send({ image: videoElement }).then(() => {
              processingData = false
              videoElement.requestVideoFrameCallback(onAnimationFrame)
            })
          }
        }
        videoElement.requestVideoFrameCallback(onAnimationFrame)
      }
      videoElement.onpause = function (e) {
        videoActive.set(false)
      }
    }
  }, [videoRef, videoStream])

  useLayoutEffect(() => {
    if (canvasRef.current !== null) {
      const canvasElement = canvasRef.current
      canvasCtxRef.current = canvasElement.getContext('2d') //canvas context
    }
  }, [canvasRef])

  // Enable video via the media server
  useEffect(() => {
    if (mediaConnection?.connected.value) toggleWebcamPaused()
  }, [mediaConnection?.connected])

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      }
    })
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false, //true,
      smoothSegmentation: false, //true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
    pose.onResults(onResults)
    mediapipe.set(pose)

    RecordingFunctions.getRecordings()
  }, [])

  // Todo: Separate canvas and webcam into separate, reusable components (or create stories / switch to existing)
  return (
    <div className="w-fit-content h-fit-content relative pointer-events-auto">
      {!ready && (
        <div className="w-full absolute z-10 flex justify-center items-center">
          <LoadingCircle message={t('common:loader.connecting')} />
        </div>
      )}
      <video className="w-full h-full -z-1 scale-x-[-1]" ref={videoRef} />
      <div className="object-contain absolute top-0" style={{ objectFit: 'contain', top: '0px' }}>
        <canvas ref={canvasRef} />
      </div>
      {ready && (
        <div className="relative">
          <button
            className="bottom-0 right-0  bg-grey pointer-events-auto"
            style={{ pointerEvents: 'all' }}
            onClick={onToggleRecording}
          >
            {recordingState.started.value ? (recordingState.recordingID.value ? 'Stop' : 'Starting...') : 'Record'}
          </button>
          <div></div>
        </div>
      )}
      {recordingState.recordings.value.map((recording) => (
        <div key={recording.id} className="bg-grey pointer-events-auto" style={{ pointerEvents: 'all' }}>
          {recordingState.playback.value === recording.id ? (
            <button
              style={{ pointerEvents: 'all' }}
              onClick={() => {
                ECSRecordingFunctions.stopPlayback({
                  recordingID: recording.id
                })
              }}
            >
              Stop - {recording.id}
            </button>
          ) : (
            <>
              <p>{recording.id}</p>
              <p>
                <button
                  style={{ pointerEvents: 'all', padding: '10px' }}
                  onClick={() => startPlayback(recording.id, isTwin.value)}
                >
                  Play
                </button>
                <span style={{ pointerEvents: 'all', padding: '10px' }}>
                  Create Twin -
                  <input
                    type="checkbox"
                    id="isClone"
                    name="isClone"
                    value="Twin"
                    onChange={(e) => isTwin.set(e.target.checked)}
                  />
                </span>
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

Mediapipe.displayName = 'Mediapipe'

Mediapipe.defaultProps = {}

export default Mediapipe
