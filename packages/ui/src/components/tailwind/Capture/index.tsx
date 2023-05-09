import { PlayCircleIcon } from '@heroicons/react/24/solid'
import { useHookstate } from '@hookstate/core'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { NormalizedLandmarkList, Pose, POSE_CONNECTIONS, ResultsListener } from '@mediapipe/pose'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { useMediaInstance } from '@etherealengine/client-core/src/common/services/MediaInstanceConnectionService'
import { InstanceChatWrapper } from '@etherealengine/client-core/src/components/InstanceChat'
import { RecordingFunctions, RecordingState } from '@etherealengine/client-core/src/recording/RecordingService'
import { MediaStreamService, MediaStreamState } from '@etherealengine/client-core/src/transports/MediaStreams'
import {
  closeDataProducer,
  SocketWebRTCClientNetwork,
  toggleWebcamPaused
} from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { ECSRecordingFunctions } from '@etherealengine/engine/src/ecs/ECSRecording'
import { mocapDataChannelType, MotionCaptureFunctions } from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import Drawer from '@etherealengine/ui/src/components/tailwind/Drawer'
import Header from '@etherealengine/ui/src/components/tailwind/Header'
import RecordingsList from '@etherealengine/ui/src/components/tailwind/RecordingList'
import Toolbar from '@etherealengine/ui/src/components/tailwind/Toolbar'
import Canvas from '@etherealengine/ui/src/primitives/tailwind/Canvas'
import LoadingCircle from '@etherealengine/ui/src/primitives/tailwind/LoadingCircle'
import Video from '@etherealengine/ui/src/primitives/tailwind/Video'

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
const startPlayback = async (recordingID: string, twin = true) => {
  const network = Engine.instance.worldNetwork as SocketWebRTCClientNetwork
  if (getState(RecordingState).playback && network.dataProducers.has(mocapDataChannelType)) {
    await closeDataProducer(network, mocapDataChannelType)
  }
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

const CaptureDashboard = () => {
  const mediaStreamState = useHookstate(getMutableState(MediaStreamState))
  const [videoStatus, setVideoStatus] = useState('')

  const poseDetectorRef = useRef<Pose>()
  const isDetecting = useHookstate(false)

  const staticImageMode = useHookstate(true)
  const modelComplexity = useHookstate(1)
  const smoothLandmarks = useHookstate(true)
  const enableSegmentation = useHookstate(false)
  const smoothSegmentation = useHookstate(false)
  const minDetectionConfidence = useHookstate(0.5)
  const minTrackingConfidence = useHookstate(0.5)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null)

  const videoStream = useHookstate(getMutableState(MediaStreamState).videoStream)

  const mediaConnection = useMediaInstance()
  const recordingState = useHookstate(getMutableState(RecordingState))

  const modelLoaded = useHookstate(false)
  const isVideoFlipped = useHookstate(true)

  // Restart dectector when option states is updated
  useEffect(() => {
    if (poseDetectorRef.current) {
      stopDetecting()
      const detector = createPoseDetector()
      startDetecting(detector)
    }
  }, [
    staticImageMode?.value,
    modelComplexity?.value,
    smoothLandmarks?.value,
    enableSegmentation?.value,
    smoothSegmentation?.value,
    minDetectionConfidence?.value,
    minTrackingConfidence?.value
  ])

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

  const mediapipe = useHookstate(null as Pose | null)

  const videoActive = useHookstate(false)

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      const factor = isVideoFlipped.value === true ? '-1' : '1'
      videoRef.current.style.transform = `scaleX(${factor})`
      canvasRef.current.style.transform = `scaleX(${factor})`
    }
  }, [canvasRef, videoRef, isVideoFlipped])

  const startDetecting = async (poseDetector) => {
    await poseDetector.setOptions({
      staticImageMode: staticImageMode.value,
      modelComplexity: modelComplexity.value,
      smoothLandmarks: smoothLandmarks.value,
      enableSegmentation: enableSegmentation.value,
      smoothSegmentation: smoothSegmentation.value,
      minDetectionConfidence: minDetectionConfidence.value,
      minTrackingConfidence: minTrackingConfidence.value
    })
    poseDetector.onResults(onResults)
    isDetecting.set(true)
  }

  const toggleDetecting = async () => {
    if (isDetecting?.value === true) {
      await stopDetecting()
    } else {
      const detector = createPoseDetector()
      await startDetecting(detector)
    }
  }

  const stopDetecting = async () => {
    isDetecting.set(false)
    // await poseDetectorRef.current?.close()
    // poseDetectorRef.current = null
  }

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
      videoElement.onloadedmetadata = () => {
        videoElement.style.transform = `scaleX(${isVideoFlipped.value ? -1 : 1})`
        if (videoElement.paused) videoElement.play()
      }
      videoElement.onplay = () => {
        videoActive.set(true)
        let processingData = false
        const onAnimationFrame = () => {
          if (!videoActive.value) {
            processingData = false
            return
          }
          if (canvasRef.current) {
            canvasRef.current.width = videoElement.clientWidth
            canvasRef.current.height = videoElement.clientHeight
            canvasRef.current.style.transform = `scaleX(${isVideoFlipped.value ? -1 : 1})`
          }
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
      videoElement.onpause = () => {
        videoActive.set(false)
      }
    }
  }, [videoRef, videoStream])

  useLayoutEffect(() => {
    if (canvasRef.current !== null) {
      const canvasElement = canvasRef.current
      canvasCtxRef.current = canvasElement.getContext('2d') //canvas context
      // canvasCtxRef?.current?.scale(isVideoFlipped.value ? -1 : 1, 1);
    }
  }, [canvasRef])

  // Enable video via the media server
  useEffect(() => {
    // if (mediaConnection?.connected.value) toggleWebcamPaused()
  }, [mediaConnection?.connected])

  const createPoseDetector = () => {
    if (poseDetectorRef.current) return poseDetectorRef.current

    const poseDetector = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      }
    })
    poseDetectorRef.current = poseDetector
    mediapipe.set(poseDetector)
    return poseDetector
  }

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      if (isDetecting?.value) {
        // start detecting on mount
        const detector = createPoseDetector()
        startDetecting(detector)
      }
    }
    RecordingFunctions.getRecordings()
  }, [videoRef, canvasRef])

  useEffect(() => {
    const isCamVideoEnabled = mediaStreamState.camVideoProducer.value != null && !mediaStreamState.videoPaused.value

    setVideoStatus(
      mediaConnection?.connected?.value === false && videoActive?.value === false
        ? 'loading'
        : isCamVideoEnabled !== true
        ? 'ready'
        : 'active'
    )
  }, [mediaConnection?.connected, videoActive])

  return (
    <div className="w-full">
      {/* <ul className="">
        <li>{`videoStatus: ${videoStatus}`}</li>
        <li>{`mediaConnection: ${mediaConnection?.connected?.value}`}</li>
        <li>{`videoActive: ${videoActive?.value}`}</li>
        <li>{`camVideoProducer: ${mediaStreamState.camVideoProducer.value}`}</li>
        <li>{`videoPaused: ${mediaStreamState.videoPaused.value}`}</li>
        <li>{`isDetecting: ${isDetecting?.value}`}</li>
      </ul> */}
      <Drawer
        settings={
          <div className="w-100 bg-base-100">
            <div tabIndex={0} className="collapse collapse-open">
              <div className="collapse-title w-full h-[50px]">
                <h1>Pose Options</h1>
              </div>
              <div className="collapse-content w-full h-auto">
                <ul className="text-base-content w-full h-auto">
                  <li>
                    <label className="label">
                      <span className="label-text">Model Complexity: {modelComplexity.value}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="1"
                      value={modelComplexity.value}
                      className="range w-full"
                      onChange={(e) => {
                        modelComplexity.set(parseInt(e.currentTarget.value))
                      }}
                    />
                  </li>
                  <li>
                    <label className="cursor-pointer label">
                      <span className="label-text">Min Detection Confidence: {minDetectionConfidence.value}</span>
                    </label>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.1"
                      value={minDetectionConfidence.value}
                      className="w-full range"
                      onChange={(e) => {
                        minDetectionConfidence.set(parseFloat(e.currentTarget.value))
                      }}
                    />
                  </li>
                  <li>
                    <label className="cursor-pointer label">
                      <span className="label-text">Min Tracking Confidence: {minTrackingConfidence.value}</span>
                    </label>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.1"
                      value={minTrackingConfidence.value}
                      className="w-full range"
                      onChange={(e) => {
                        minTrackingConfidence.set(parseFloat(e.currentTarget.value))
                      }}
                    />
                  </li>
                  <li>
                    <label className="label">
                      <span className="label-text">Smooth Landmarks</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        defaultChecked={smoothLandmarks?.value}
                        onChange={(e) => {
                          staticImageMode.set(e.currentTarget.checked)
                        }}
                      />
                    </label>
                  </li>
                  <li>
                    <label className="cursor-pointer label">
                      <span className="label-text">Enable Segmentation</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        defaultChecked={enableSegmentation?.value}
                        onChange={(e) => {
                          staticImageMode.set(e.currentTarget.checked)
                        }}
                      />
                    </label>
                  </li>
                  <li>
                    <label className="cursor-pointer label">
                      <span className="label-text">Smooth Segmentation</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        defaultChecked={smoothSegmentation?.value}
                        onChange={(e) => {
                          staticImageMode.set(e.currentTarget.checked)
                        }}
                      />
                    </label>
                  </li>
                  <li className="">
                    <label className="label">
                      <span className="label-text">Static Image Mode</span>
                      <input
                        type="checkbox"
                        disabled
                        className="toggle toggle-primary"
                        defaultChecked={staticImageMode?.value}
                        onChange={(e) => {
                          staticImageMode.set(e.currentTarget.checked)
                        }}
                      />
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        }
      >
        <Header />
        <div className="grid justify-items-center grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4 pb-6 overflow-hidden">
            <div className="w-full relative ">
              <div className="relative w-full h-auto max-w-full" style={{ backgroundColor: '#000000' }}>
                <Video ref={videoRef} className="w-full h-auto max-w-full" />
              </div>
              <div className="object-contain absolute top-0 z-20" style={{ objectFit: 'contain', top: '0px' }}>
                <Canvas ref={canvasRef} />
              </div>
              {videoStatus === 'loading' ? (
                <LoadingCircle message="Loading..." />
              ) : videoStatus !== 'active' ? (
                <button
                  onClick={toggleWebcamPaused}
                  className="absolute btn btn-ghost w-full h-full bg-none"
                  style={{ objectFit: 'contain', top: '0px' }}
                >
                  <div className="grid w-screen h-screen place-items-center">
                    <h1>Enable Camera</h1>
                  </div>
                </button>
              ) : null}
            </div>
            <div className="w-full relative ">
              {mediaConnection?.connected?.value ? (
                <Toolbar
                  className="w-full z-30 fixed bottom-0"
                  videoStatus={videoStatus}
                  isDetecting={isDetecting?.value}
                  onToggleRecording={onToggleRecording}
                  toggleWebcam={toggleWebcamPaused}
                  toggleDetecting={toggleDetecting}
                  isRecording={recordingState.started.value}
                  recordingStatus={recordingState.recordingID.value}
                  isVideoFlipped={isVideoFlipped.value}
                  flipVideo={(val) => {
                    isVideoFlipped.set(val)
                  }}
                  cycleCamera={MediaStreamService.cycleCamera}
                />
              ) : (
                <div className="navbar border-none w-full z-30 fixed bottom-0"></div>
              )}
            </div>
          </div>
          <div className="card p-4">
            <div className="w-full relative">
              <RecordingsList
                {...{
                  startPlayback,
                  stopPlayback: ECSRecordingFunctions.stopPlayback,
                  recordingState
                }}
              />
            </div>
          </div>
        </div>
        <footer className="footer fixed bottom-0">
          <div style={{ display: 'none' }}>
            <InstanceChatWrapper />
          </div>
        </footer>
      </Drawer>
    </div>
  )
}

CaptureDashboard.displayName = 'CaptureDashboard'

CaptureDashboard.defaultProps = {}

export default CaptureDashboard
