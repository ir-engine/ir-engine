import { PlayCircleIcon } from '@heroicons/react/24/solid'
import { useHookstate } from '@hookstate/core'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { NormalizedLandmarkList, Options, Pose, POSE_CONNECTIONS, ResultsListener } from '@mediapipe/pose'
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
import { useVideoFrameCallback } from '@etherealengine/common/src/utils/useVideoFrameCallback'
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
    maxPacketLifeTime: 0,
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
  const isDetecting = useHookstate(false)

  const poseDetector = useHookstate(null as null | Pose)
  const poseOptions = useHookstate({
    selfieMode: false,
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  } as Options)
  const processingFrame = useHookstate(false)

  const videoRef = useRef<HTMLVideoElement>()
  const canvasRef = useRef<HTMLCanvasElement>()
  const canvasCtxRef = useRef<CanvasRenderingContext2D>()

  const videoStream = useHookstate(getMutableState(MediaStreamState).videoStream)

  const mediaConnection = useMediaInstance()
  const mediaStreamState = useHookstate(getMutableState(MediaStreamState))
  const recordingState = useHookstate(getMutableState(RecordingState))

  const videoActive = useHookstate(false)

  useLayoutEffect(() => {
    canvasCtxRef.current = canvasRef.current!.getContext('2d')!
    const factor = poseOptions.selfieMode.value === true ? '-1' : '1'
    // canvasRef.current!.style.transform = `scaleX(${factor})`
    videoRef.current!.style.transform = `scaleX(${factor})`
    videoRef.current!.srcObject = videoStream.value
    videoRef.current!.onplay = () => videoActive.set(true)
    videoRef.current!.onpause = () => videoActive.set(false)
  }, [videoStream, poseOptions.selfieMode])

  useEffect(() => {
    poseDetector.value?.setOptions(poseOptions.value)
  }, [poseDetector, poseOptions])

  useEffect(() => {
    if (!isDetecting?.value) return

    processingFrame.set(false)

    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      }
    })

    pose.onResults((results) => {
      const { poseWorldLandmarks, poseLandmarks } = results
      sendResults(poseWorldLandmarks)
      processingFrame.set(false)

      if (!canvasCtxRef.current || !canvasRef.current || !poseLandmarks) return

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
    })

    poseDetector.set(pose)
    return () => {
      pose.close()
      poseDetector.set(null)
    }
  }, [isDetecting])

  useVideoFrameCallback(videoRef.current, (videoTime, metadata) => {
    canvasRef.current!.width = videoRef.current!.clientWidth
    canvasRef.current!.height = videoRef.current!.clientHeight

    if (processingFrame.value) return

    if (poseDetector.value) {
      processingFrame.set(true)
      poseDetector.value?.send({ image: videoRef.current! }).finally(() => {
        processingFrame.set(false)
      })
    }
  })

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

  const isCamVideoEnabled =
    mediaStreamState?.camVideoProducer?.value !== null && mediaStreamState.videoPaused.value !== null
  const videoStatus =
    mediaConnection?.connected?.value === false && videoActive?.value === false
      ? 'loading'
      : isCamVideoEnabled !== true
      ? 'ready'
      : 'active'

  return (
    <div className="w-full">
      {/* <ul className="">
        <li>{`videoStatus: ${videoStatus}`} {`mediaConnection: ${mediaConnection?.connected?.value}`}
        {`videoActive: ${videoActive?.value}`}
        {`camVideoProducer: ${mediaStreamState.camVideoProducer.value}`}
        {`videoPaused: ${mediaStreamState.videoPaused.value}`}
        {`isDetecting: ${isDetecting?.value}`}</li>
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
                      <span className="label-text">Model Complexity: {poseOptions.modelComplexity.value}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="1"
                      value={poseOptions.modelComplexity.value}
                      className="range w-full"
                      onChange={(e) => {
                        poseOptions.modelComplexity.set(parseInt(e.currentTarget.value) as 0 | 1 | 2)
                      }}
                    />
                  </li>
                  <li>
                    <label className="cursor-pointer label">
                      <span className="label-text">
                        Min Detection Confidence: {poseOptions.minDetectionConfidence.value}
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.1"
                      value={poseOptions.minDetectionConfidence.value}
                      className="w-full range"
                      onChange={(e) => {
                        poseOptions.minDetectionConfidence.set(parseFloat(e.currentTarget.value))
                      }}
                    />
                  </li>
                  <li>
                    <label className="cursor-pointer label">
                      <span className="label-text">
                        Min Tracking Confidence: {poseOptions.minTrackingConfidence.value}
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.1"
                      value={poseOptions.minTrackingConfidence.value}
                      className="w-full range"
                      onChange={(e) => {
                        poseOptions.minTrackingConfidence.set(parseFloat(e.currentTarget.value))
                      }}
                    />
                  </li>
                  <li>
                    <label className="label">
                      <span className="label-text">Smooth Landmarks</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        defaultChecked={poseOptions.smoothLandmarks?.value}
                        onChange={(e) => {
                          poseOptions.smoothLandmarks.set(e.currentTarget.checked)
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
                        defaultChecked={poseOptions.enableSegmentation?.value}
                        onChange={(e) => {
                          poseOptions.enableSegmentation.set(e.currentTarget.checked)
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
                        defaultChecked={poseOptions.smoothSegmentation?.value}
                        onChange={(e) => {
                          poseOptions.smoothSegmentation.set(e.currentTarget.checked)
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
                  onClick={() => {
                    if (mediaConnection?.connected?.value) toggleWebcamPaused()
                  }}
                  className="absolute btn btn-ghost w-full h-full bg-none"
                  style={{ objectFit: 'contain', top: '0px' }}
                >
                  <div className="grid w-screen h-screen place-items-center">
                    <h1>{mediaConnection?.connected?.value ? 'Enable Camera' : 'Loading...'}</h1>
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
                  toggleDetecting={() => isDetecting.set((v) => !v)}
                  isRecording={recordingState.started.value}
                  recordingStatus={recordingState.recordingID.value}
                  isVideoFlipped={poseOptions.selfieMode.value}
                  flipVideo={(v) => poseOptions.selfieMode.set(v)}
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
