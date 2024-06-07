/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License") you may not use this file except in compliance
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

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DrawingUtils, FilesetResolver, NormalizedLandmark, PoseLandmarker } from '@mediapipe/tasks-vision'
import React, { useEffect, useLayoutEffect, useRef } from 'react'
import ReactSlider from 'react-slider'
import { twMerge } from 'tailwind-merge'

import { useWorldNetwork } from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import { useMediaNetwork } from '@etherealengine/client-core/src/common/services/MediaInstanceConnectionService'
import { useResizableVideoCanvas } from '@etherealengine/client-core/src/hooks/useResizableVideoCanvas'
import { useScrubbableVideo } from '@etherealengine/client-core/src/hooks/useScrubbableVideo'
import { CaptureClientSettingsState } from '@etherealengine/client-core/src/media/CaptureClientSettingsState'
import { LocationState } from '@etherealengine/client-core/src/social/services/LocationService'
import { MediaStreamState } from '@etherealengine/client-core/src/transports/MediaStreams'
import {
  SocketWebRTCClientNetwork,
  toggleWebcamPaused
} from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import {
  RecordingID,
  StaticResourceType,
  recordingPath,
  staticResourcePath
} from '@etherealengine/common/src/schema.type.module'
import { useVideoFrameCallback } from '@etherealengine/common/src/utils/useVideoFrameCallback'
import { getComponent } from '@etherealengine/ecs'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { GLTFAssetState } from '@etherealengine/engine/src/gltf/GLTFState'
import {
  MotionCaptureFunctions,
  MotionCaptureResults,
  mocapDataChannelType
} from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import {
  ECSRecordingActions,
  PlaybackState,
  RecordingState,
  activePlaybacks
} from '@etherealengine/engine/src/recording/ECSRecordingSystem'
import {
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  syncStateWithLocalStorage,
  useHookstate,
  useMutableState
} from '@etherealengine/hyperflux'
import { NetworkState } from '@etherealengine/network'
import { useGet } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import Header from '@etherealengine/ui/src/components/tailwind/Header'
import RecordingsList from '@etherealengine/ui/src/components/tailwind/RecordingList'
import Canvas from '@etherealengine/ui/src/primitives/tailwind/Canvas'
import Video from '@etherealengine/ui/src/primitives/tailwind/Video'

import Button from '../../primitives/tailwind/Button'

/**
 * Start playback of a recording
 * - If we are streaming data, close the data producer
 */
export const startPlayback = async (recordingID: RecordingID, twin = true, fromServer = false) => {
  const network = NetworkState.worldNetwork as SocketWebRTCClientNetwork
  // close the data producer if we are streaming data
  // const dataProducer = MediasoupDataProducerConsumerState.getProducerByDataChannel(
  //   network.id,
  //   mocapDataChannelType
  // ) as DataProducer
  // if (getState(PlaybackState).recordingID && dataProducer) {
  //   dispatchAction(
  //     MediasoupMediaProducerActions.producerClosed({
  //       producerID: dataProducer.id,
  //       $network: network.id,
  //       $topic: network.topic
  //     })
  //   )
  // }
  // // Server playback
  // PlaybackState.startPlayback({
  //   recordingID,
  //   targetUser: twin ? undefined : Engine.instance.userID
  // })

  // Client Playback
  dispatchAction(
    ECSRecordingActions.startPlayback({
      recordingID,
      targetUser: Engine.instance.userID,
      autoplay: false
    })
  )
}

export const stopPlayback = () => {
  const recordingID = getState(PlaybackState).recordingID
  if (!recordingID) return
  dispatchAction(
    ECSRecordingActions.stopPlayback({
      recordingID
    })
  )
}

const sendResults = (results: MotionCaptureResults) => {
  const network = NetworkState.worldNetwork as SocketWebRTCClientNetwork
  if (!network?.ready) return
  const data = MotionCaptureFunctions.sendResults(results)
  network.transport.bufferToAll(mocapDataChannelType, Engine.instance.store.peerID, data)
}

// const useVideoStatus = () => {
//   const videoStream = useHookstate(getMutableState(MediaStreamState).videoStream)
//   const videoPaused = useHookstate(getMutableState(MediaStreamState).videoPaused)
//   const videoActive = !!videoStream.value && !videoPaused.value
//   const mediaNetworkState = useMediaNetwork()
//   if (!mediaNetworkState?.ready?.value) return 'loading'
//   if (!videoActive) return 'ready'
//   return 'active'
// }

export const CaptureState = defineState({
  name: 'CaptureState',
  initial: {
    detectingStatus: 'inactive' as 'inactive' | 'active' | 'loading' | 'ready'
  }
})

const CaptureMode = () => {
  const captureState = useMutableState(CaptureClientSettingsState)
  const captureSettings = captureState?.nested('settings')?.value
  const displaySettings = captureSettings.filter((s) => s?.name.toLowerCase() === 'display')[0]
  const trackingSettings = captureSettings.filter((s) => s?.name.toLowerCase() === 'tracking')[0]
  const debugSettings = captureSettings.filter((s) => s?.name.toLowerCase() === 'debug')[0]

  const recordingID = useHookstate(getMutableState(RecordingState).recordingID)
  const startedAt = useHookstate(getMutableState(RecordingState).startedAt)
  const active = useHookstate(getMutableState(RecordingState).active)

  // todo include a mechanism to confirm that the recording has started/stopped
  const onToggleRecording = () => {
    if (recordingID.value) {
      RecordingState.stopRecording({
        recordingID: recordingID.value
      })
    } else {
      RecordingState.requestRecording({
        user: { Avatar: true },
        peers: { [Engine.instance.store.peerID]: { Audio: true, Video: true, Mocap: true } }
      })
    }
  }

  const mediaNetworkState = useMediaNetwork()

  const detectingStatus = useHookstate(getMutableState(CaptureState).detectingStatus)
  const isDetecting = detectingStatus.value === 'active'

  const poseDetector = useHookstate(null as null | PoseLandmarker)

  const processingFrame = useHookstate(false)

  // const videoStatus = useVideoStatus()

  const { videoRef, canvasRef, canvasCtxRef, resizeCanvas } = useResizableVideoCanvas()

  const videoStream = useHookstate(getMutableState(MediaStreamState).videoStream)

  useEffect(() => {
    detectingStatus.set('loading')
    FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm').then((vision) => {
      PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
          delegate: 'GPU'
        },
        runningMode: 'VIDEO'
      }).then((pose) => {
        pose
          .setOptions({
            runningMode: 'VIDEO',
            minTrackingConfidence: trackingSettings.minTrackingConfidence,
            minPoseDetectionConfidence: trackingSettings.minDetectionConfidence
          })
          .then(() => detectingStatus.set('ready'))
        poseDetector.set(pose)
      })
    })
  }, [])

  const drawingUtils = useHookstate(null as null | DrawingUtils)
  useEffect(() => {
    drawingUtils.set(new DrawingUtils(canvasCtxRef.current!))
  }, [])

  useLayoutEffect(() => {
    canvasCtxRef.current = canvasRef.current!.getContext('2d')!
    videoRef.current!.srcObject = videoStream.value
    resizeCanvas()
  }, [videoStream])

  // const throttledSend = throttle(sendResults, 1)

  useVideoFrameCallback(videoRef.current, (videoTime, metadata) => {
    if (!poseDetector.value || processingFrame.value || detectingStatus.value !== 'active' || !videoRef.current) return

    poseDetector.value.detectForVideo(videoRef.current, performance.now(), (result) => {
      const worldLandmarks = result.worldLandmarks[0]
      const landmarks = result.landmarks[0]
      sendResults({ worldLandmarks, landmarks })
      drawingUtils.value && drawPoseToCanvas(result.landmarks, canvasCtxRef, canvasRef, drawingUtils.value)
    })
  })

  useEffect(() => {
    if (!isDetecting) return

    if (!poseDetector.value) {
      return
    }

    processingFrame.set(false)

    return () => {
      detectingStatus.set('inactive')
      if (poseDetector.value) {
        poseDetector.value.close()
      }
      poseDetector.set(null)

      if (canvasCtxRef.current && canvasRef.current) {
        canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }, [poseDetector, isDetecting])

  const getRecordingStatus = () => {
    if (!active.value) return 'ready'
    if (startedAt.value) return 'active'
    return 'starting'
  }
  const recordingStatus = getRecordingStatus()

  return (
    <div className="container pointer-events-auto m-4 mx-auto w-full max-w-[1024px]">
      <div className="h-auto w-full px-2">
        <div className="relative aspect-video h-auto w-full overflow-hidden">
          <div className="absolute left-0 top-0 flex h-full w-full items-center bg-black">
            <Video
              ref={videoRef}
              className={twMerge('h-auto w-full opacity-100', !displaySettings?.showVideo && 'opacity-0')}
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
          <div className="z-1 absolute left-0 top-0 h-auto min-w-full object-contain">
            <Canvas ref={canvasRef} style={{ transform: 'scaleX(-1)' }} />
          </div>
          <Button
            className="z-2 container absolute left-0 top-0 m-0 mx-auto h-full w-full bg-transparent p-0"
            onClick={() => {
              if (mediaNetworkState?.ready?.value) toggleWebcamPaused()
            }}
          >
            <a>{!videoStream.value ? 'CLICK TO ENABLE VIDEO' : ''}</a>
          </Button>
        </div>
      </div>
      <div className="relative aspect-video h-auto w-full overflow-hidden">
        <div className="container mx-auto w-full">
          <Button
            className="font=[lato] padding-[10px] m-2 h-[60px] w-[220px] rounded-full bg-[#292D3E] text-center text-sm font-bold shadow-md"
            title="Toggle Detection"
            onClick={() => {
              detectingStatus.set(detectingStatus.value === 'active' ? 'inactive' : 'active')
            }}
          >
            <a className="text-xl normal-case">
              {detectingStatus.value === 'active' ? 'STOP DETECTING' : 'START DETECTING'}
            </a>
          </Button>
          <Button
            aria-disabled={recordingStatus === 'starting'}
            className="font=[lato] padding-[10px] m-2 h-[60px] w-[220px] rounded-full bg-[#292D3E] text-center text-sm font-bold shadow-md"
            title="Toggle Recording"
            onClick={onToggleRecording}
          >
            <a className="text-xl normal-case">{recordingStatus === 'active' ? 'STOP RECORDING' : 'START RECORDING'}</a>
          </Button>
          {/* <Toolbar
            className="w-full"
            videoStatus={videoStatus}
            detectingStatus={detectingStatus.value}
            onToggleRecording={onToggleRecording}
            toggleWebcam={toggleWebcamPaused}
            toggleDetecting={() => {
              detectingStatus.set(detectingStatus.value === 'active' ? 'inactive' : 'active')
            }}
            isRecording={!!recordingID.value}
            recordingStatus={recordingStatus}
            cycleCamera={MediaStreamService.cycleCamera}
          /> */}
        </div>
      </div>
    </div>
  )
}

export const drawPoseToCanvas = (
  poseLandmarks: NormalizedLandmark[][],
  canvasCtxRef: React.MutableRefObject<CanvasRenderingContext2D | undefined>,
  canvasRef: React.RefObject<HTMLCanvasElement | undefined>,
  drawingUtils: DrawingUtils
) => {
  if (!canvasCtxRef.current || !canvasRef.current) return
  canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  if (poseLandmarks && canvasCtxRef.current) {
    for (let i = 0; i < poseLandmarks.length; i++) {
      drawingUtils.drawConnectors(poseLandmarks[i], PoseLandmarker.POSE_CONNECTIONS, {
        color: '#fff',
        lineWidth: 2
      })
      drawingUtils.drawLandmarks(poseLandmarks[i], { color: '#fff', lineWidth: 3 })
    }
  }
}

const VideoPlayback = (props: {
  startTime: number
  video: StaticResourceType
  mocap: StaticResourceType | undefined
}) => {
  const { video } = props
  const videoSrc = video.url

  const { videoRef, canvasRef, canvasCtxRef, resizeCanvas } = useResizableVideoCanvas()

  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.style.transform = `scaleX(-1)`
    videoRef.current.addEventListener('loadedmetadata', () => {
      resizeCanvas()
      if (videoRef.current) videoRef.current.play()
      if (canvasRef.current) canvasCtxRef.current = canvasRef.current.getContext('2d')!
    })
  }, [videoRef.current])

  const playing = useHookstate(getMutableState(PlaybackState).playing)
  const currentTimeSeconds = useHookstate(getMutableState(PlaybackState).currentTime)

  useEffect(() => {
    if (!videoRef.current) return
    if (playing.value) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }
  }, [playing])

  const { handlePositionChange } = useScrubbableVideo(videoRef)

  const drawingUtils = useHookstate(null as null | DrawingUtils)
  useEffect(() => {
    drawingUtils.set(new DrawingUtils(canvasCtxRef.current!))
  }, [])

  /** When the current time changes, update the video's current time and render motion capture */
  useEffect(() => {
    if (!videoRef.current || typeof currentTimeSeconds.value !== 'number') return

    if (!playing.value) handlePositionChange(currentTimeSeconds.value)

    const data = activePlaybacks.get(getState(PlaybackState).recordingID!)?.dataChannelChunks?.get(mocapDataChannelType)

    if (data) {
      const currentTimeMS = currentTimeSeconds.value * 1000
      const frame = data.frames.find((frame) => frame.timecode > currentTimeMS)
      if (!frame) return
      drawingUtils.value &&
        drawPoseToCanvas(frame.data.results.poseLandmarks, canvasCtxRef, canvasRef, drawingUtils.value)
    }
  }, [currentTimeSeconds])

  return (
    <div className="aspect-[4/3] h-full w-auto">
      <div className="left-0 top-0 aspect-[4/3] items-center bg-black">
        <Video
          ref={videoRef}
          src={videoSrc}
          controls={false}
          className={twMerge('aspect-[4/3] h-auto w-full opacity-100')}
        />
      </div>
      <div className="z-1 pointer-events-none absolute left-0 top-0 aspect-[4/3] h-auto w-auto">
        <Canvas ref={canvasRef} />
      </div>
    </div>
  )
}

const EngineCanvas = () => {
  const ref = useRef(null as null | HTMLDivElement)

  useEffect(() => {
    if (!ref?.current) return

    const canvas = getComponent(Engine.instance.viewerEntity, RendererComponent).renderer.domElement
    ref.current.appendChild(canvas)

    getComponent(Engine.instance.viewerEntity, RendererComponent).needsResize = true

    // return () => {
    //   const canvas = document.getElementById('engine-renderer-canvas')!
    //   parent.removeChild(canvas)
    // }
  }, [ref])

  return (
    <div className="relative aspect-[2/3] h-full w-auto">
      <div ref={ref} className="h-full w-full" />
    </div>
  )
}

export const PlaybackControls = (props: { durationSeconds: number }) => {
  const currentTime = useHookstate(getMutableState(PlaybackState).currentTime)
  const playing = useHookstate(getMutableState(PlaybackState).playing)

  const setCurrentTime = (time) => {
    playing.set(false)
    currentTime.set(time)
  }

  const { durationSeconds } = props
  return (
    <div className="flex h-full w-full flex-row">
      <div className="relative aspect-video overflow-hidden">
        <Button
          className="z-2 container h-[40px] w-auto"
          onClick={() => {
            playing.set(!playing.value)
          }}
        >
          {playing.value ? 'Pause' : 'Play'}
        </Button>
      </div>
      <ReactSlider
        className="my-2 h-4 w-full cursor-pointer rounded-lg bg-gray-300"
        min={0}
        value={playing.value ? currentTime.value : undefined}
        max={durationSeconds}
        step={1 / 60} // todo store recording framerate in recording
        onChange={setCurrentTime}
        renderThumb={(props, state) => {
          return (
            <div
              {...props}
              className="font=[lato] h-4 w-8 rounded-full bg-white text-center text-sm font-bold shadow-md"
            >
              {Math.round(state.valueNow)}
            </div>
          )
        }}
      />
    </div>
  )
}

const PlaybackMode = () => {
  const recordingID = useHookstate(getMutableState(PlaybackState).recordingID)
  const locationState = useMutableState(LocationState)

  const recording = useGet(recordingPath, recordingID.value!)
  const scene = useGet(staticResourcePath, locationState.currentLocation.location.sceneId.value).data

  useEffect(() => {
    recording.refetch()
  }, [])

  /**
   * Load scene in, and auto-unload upon recording stop
   * @todo - wait until scene has loaded to start playback
   */
  useEffect(() => {
    if (
      !locationState.currentLocation.location.sceneId.value ||
      locationState.invalidLocation.value ||
      locationState.currentLocation.selfNotAuthorized.value ||
      !scene
    )
      return
    return GLTFAssetState.loadScene(scene.url, scene.id)
  }, [scene])

  const ActiveRecording = () => {
    const data = recording.data!
    const startTime = new Date(data.createdAt).getTime()
    const endTime = new Date(data.updatedAt).getTime()
    const durationSeconds = (endTime - startTime) / 1000

    // get all video resources, paired with motion capture data if it exists
    const videoPlaybackPairs = data.resources.reduce(
      (acc, r) => {
        if (r.mimeType.includes('video')) {
          acc.push({
            video: r,
            mocap: data.resources.find((r) => r.key.includes(mocapDataChannelType))
          })
        }
        return acc
      },
      [] as { video: StaticResourceType; mocap: StaticResourceType | undefined }[]
    )

    return (
      <>
        <div className="flex-column relative aspect-video h-auto w-full items-center justify-center overflow-hidden">
          <div className="flex h-full w-full max-w-full flex-row items-center justify-center">
            {videoPlaybackPairs.map((r) => (
              <VideoPlayback startTime={startTime} {...r} key={r.video.id} />
            ))}
            <EngineCanvas />
          </div>
        </div>
        <PlaybackControls durationSeconds={durationSeconds} />
      </>
    )
  }

  const NoRecording = () => {
    return (
      <div className="container relative mx-auto flex aspect-video w-auto max-w-[1024px] items-center justify-center overflow-hidden bg-black">
        <h1 className="text-2xl">No Recording Selected</h1>
      </div>
    )
  }

  return (
    <div className="container pointer-events-auto mx-auto w-full content-center items-center justify-center">
      <div className="h-auto w-full px-2">{recording.data ? <ActiveRecording /> : <NoRecording />}</div>
      <div className="container mx-auto flex w-full max-w-[1024px]">
        <div className="relative m-2 h-auto w-full">
          <RecordingsList {...{ startPlayback, stopPlayback }} />
        </div>
      </div>
    </div>
  )
}

const CapturePageState = defineState({
  name: 'CapturePageState',
  initial: {
    mode: 'capture' as 'playback' | 'capture'
  },
  extension: syncStateWithLocalStorage(['mode'])
})

const CaptureDashboard = () => {
  const worldNetwork = useWorldNetwork()
  const mode = useHookstate(getMutableState(CapturePageState).mode)

  return (
    <div className="container mx-auto w-full max-w-[1024px] overflow-hidden">
      <Header mode={mode} />
      {mode.value === 'playback' ? <PlaybackMode /> : <CaptureMode />}
    </div>
  )
}

CaptureDashboard.displayName = 'CaptureDashboard'

CaptureDashboard.defaultProps = {}

export default CaptureDashboard
