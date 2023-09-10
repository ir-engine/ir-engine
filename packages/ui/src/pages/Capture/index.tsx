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
import { useHookstate } from '@hookstate/core'
import { decode } from 'msgpackr'
import React, { RefObject, useEffect, useLayoutEffect } from 'react'
import { twMerge } from 'tailwind-merge'

import { useResizableVideoCanvas } from '@etherealengine/client-core/src/hooks/useResizableVideoCanvas'
import { useScrubbableVideo } from '@etherealengine/client-core/src/hooks/useScrubbableVideo'

import { useMediaNetwork } from '@etherealengine/client-core/src/common/services/MediaInstanceConnectionService'
import { InstanceChatWrapper } from '@etherealengine/client-core/src/components/InstanceChat'
import {
  PlaybackState,
  RecordingFunctions,
  RecordingState
} from '@etherealengine/client-core/src/recording/RecordingService'
import { MediaStreamService, MediaStreamState } from '@etherealengine/client-core/src/transports/MediaStreams'
import {
  SocketWebRTCClientNetwork,
  toggleWebcamPaused
} from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { useVideoFrameCallback } from '@etherealengine/common/src/utils/useVideoFrameCallback'
import {
  DataChannelFrame,
  ECSRecordingActions,
  ECSRecordingFunctions
} from '@etherealengine/engine/src/ecs/ECSRecordingSystem'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { CaptureClientSettingsState } from '@etherealengine/client-core/src/media/CaptureClientSettingsState'
import { useGet } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { throttle } from '@etherealengine/engine/src/common/functions/FunctionHelpers'
import {
  MotionCaptureFunctions,
  MotionCaptureResults,
  mocapDataChannelType,
  receiveResults
} from '@etherealengine/engine/src/mocap/MotionCaptureSystem'
import { MediasoupDataProducerConsumerState } from '@etherealengine/engine/src/networking/systems/MediasoupDataProducerConsumerState'
import { MediaProducerActions } from '@etherealengine/engine/src/networking/systems/MediasoupMediaProducerConsumerState'
import { StaticResourceType } from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import { RecordingID, recordingPath } from '@etherealengine/engine/src/schemas/recording/recording.schema'
import { NO_PROXY, defineState, dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'
import Drawer from '@etherealengine/ui/src/components/tailwind/Drawer'
import Header from '@etherealengine/ui/src/components/tailwind/Header'
import RecordingsList from '@etherealengine/ui/src/components/tailwind/RecordingList'
import Canvas from '@etherealengine/ui/src/primitives/tailwind/Canvas'
import Video from '@etherealengine/ui/src/primitives/tailwind/Video'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { NormalizedLandmarkList, Options, POSE_CONNECTIONS, Pose } from '@mediapipe/pose'
import { DataProducer } from 'mediasoup-client/lib/DataProducer'
import ReactSlider from 'react-slider'
import Toolbar from '../../components/tailwind/mocap/Toolbar'
/**
 * Start playback of a recording
 * - If we are streaming data, close the data producer
 */
export const startPlayback = async (recordingID: RecordingID, twin = true, fromServer = false) => {
  const network = Engine.instance.worldNetwork as SocketWebRTCClientNetwork
  // close the data producer if we are streaming data
  const dataProducer = MediasoupDataProducerConsumerState.getProducerByDataChannel(
    network.id,
    mocapDataChannelType
  ) as DataProducer
  if (getState(PlaybackState).recordingID && dataProducer) {
    dispatchAction(
      MediaProducerActions.producerClosed({
        producerID: dataProducer.id,
        $network: network.id,
        $topic: network.topic
      })
    )
  }
  // // Server playback
  // ECSRecordingFunctions.startPlayback({
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

const sendResults = (results: MotionCaptureResults) => {
  const network = Engine.instance.worldNetwork as SocketWebRTCClientNetwork
  if (!network?.ready) return
  const dataProducer = MediasoupDataProducerConsumerState.getProducerByDataChannel(
    network.id,
    mocapDataChannelType
  ) as DataProducer
  if (!dataProducer) {
    // if (creatingProducer) return
    // creatingProducer = true
    // createDataProducer(network, { label: mocapDataChannelType, ordered: true })
    return
  }
  if (!dataProducer?.closed && dataProducer?.readyState === 'open') {
    // console.log('sending results', results)
    const data = MotionCaptureFunctions.sendResults(results)
    dataProducer?.send(data)
  }
}

const useVideoStatus = () => {
  const videoStream = useHookstate(getMutableState(MediaStreamState).videoStream)
  const videoPaused = useHookstate(getMutableState(MediaStreamState).videoPaused)
  const videoActive = !!videoStream.value && !videoPaused.value
  const mediaNetworkState = useMediaNetwork()
  if (!mediaNetworkState?.connected?.value) return 'loading'
  if (!videoActive) return 'ready'
  return 'active'
}

export const CaptureState = defineState({
  name: 'CaptureState',
  initial: {
    isDetecting: false,
    detectingStatus: 'inactive' as 'inactive' | 'active' | 'loading'
  }
})

const CaptureMode = () => {
  const captureState = useHookstate(getMutableState(CaptureClientSettingsState))
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
      ECSRecordingFunctions.stopRecording({
        recordingID: recordingID.value
      })
    } else {
      RecordingFunctions.startRecording({
        user: { Avatar: true },
        peers: { [Engine.instance.peerID]: { Audio: true, Video: true, Mocap: true } }
      }).then((recordingID) => {
        if (recordingID) ECSRecordingFunctions.startRecording({ recordingID })
      })
    }
  }

  const mediaNetworkState = useMediaNetwork()

  const isDetecting = useHookstate(getMutableState(CaptureState).isDetecting)
  const detectingStatus = useHookstate(getMutableState(CaptureState).detectingStatus)

  const poseDetector = useHookstate(null as null | Pose)

  const processingFrame = useHookstate(false)

  const videoStatus = useVideoStatus()

  const { videoRef, canvasRef, canvasCtxRef, resizeCanvas } = useResizableVideoCanvas()

  const videoStream = useHookstate(getMutableState(MediaStreamState).videoStream)

  useEffect(() => {
    const factor = displaySettings.flipVideo === true ? '-1' : '1'
    videoRef.current!.style.transform = `scaleX(${factor})`
  }, [displaySettings.flipVideo])

  useLayoutEffect(() => {
    canvasCtxRef.current = canvasRef.current!.getContext('2d')!
    videoRef.current!.srcObject = videoStream.value
    resizeCanvas()
  }, [videoStream])

  const throttledSend = throttle(sendResults, 1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useVideoFrameCallback(videoRef.current, (videoTime, metadata) => {
    if (processingFrame.value) return

    if (poseDetector.value) {
      processingFrame.set(true)
      poseDetector.value?.send({ image: videoRef.current! }).finally(() => {
        processingFrame.set(false)
      })
    }
  })

  useEffect(() => {
    if (!isDetecting.value) return

    if (!poseDetector.value) {
      if (Pose !== undefined) {
        detectingStatus.set('loading')
        const pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
          }
        })
        pose.setOptions({
          // enableFaceGeometry: trackingSettings?.enableFaceGeometry,
          selfieMode: displaySettings?.flipVideo,
          modelComplexity: trackingSettings?.modelComplexity,
          smoothLandmarks: trackingSettings?.smoothLandmarks,
          enableSegmentation: trackingSettings?.enableSegmentation,
          smoothSegmentation: trackingSettings?.smoothSegmentation,
          // refineFaceLandmarks: trackingSettings?.refineFaceLandmarks,
          minDetectionConfidence: trackingSettings?.minDetectionConfidence,
          minTrackingConfidence: trackingSettings?.minTrackingConfidence
        } as Options)
        poseDetector.set(pose)
      }
    }

    processingFrame.set(false)

    if (poseDetector.value) {
      poseDetector.value.onResults((results) => {
        if (Object.keys(results).length === 0) return
        detectingStatus.set('active')

        const { poseWorldLandmarks, poseLandmarks } = results

        if (debugSettings?.throttleSend) {
          throttledSend({ poseWorldLandmarks, poseLandmarks })
        } else {
          sendResults({ poseWorldLandmarks, poseLandmarks })
        }

        processingFrame.set(false)

        if (displaySettings?.show2dSkeleton) {
          drawPoseToCanvas(canvasCtxRef, canvasRef!, poseLandmarks)
        }
      })
    }

    return () => {
      // detectingStatus.set('inactive')
      // if (poseDetector.value) {
      //   poseDetector.value.close()
      // }
      // poseDetector.set(null)
    }
  }, [isDetecting])

  const getRecordingStatus = () => {
    if (!active.value) return 'ready'
    if (startedAt.value) return 'active'
    return 'starting'
  }
  const recordingStatus = getRecordingStatus()

  return (
    <div className="w-full container mx-auto pointer-events-auto">
      <div className="w-full h-auto px-2">
        <div className="w-full h-auto relative aspect-video overflow-hidden">
          <div className="absolute w-full h-full top-0 left-0 flex items-center bg-black">
            <Video
              ref={videoRef}
              className={twMerge('w-full h-auto opacity-100', !displaySettings?.showVideo && 'opacity-0')}
            />
          </div>
          <div
            className="object-contain absolute top-0 left-0 z-1 min-w-full h-auto"
            style={{ objectFit: 'contain', top: '0px' }}
          >
            <Canvas ref={canvasRef} />
          </div>
          <button
            onClick={() => {
              if (mediaNetworkState?.connected?.value) toggleWebcamPaused()
            }}
            className="absolute btn btn-ghost bg-none h-full w-full container mx-auto m-0 p-0 top-0 left-0 z-2"
          >
            {videoStatus === 'ready' && <h1>Enable Camera</h1>}
            {videoStatus === 'loading' && <h1>Loading...</h1>}
          </button>
        </div>
      </div>
      <div className="w-full h-auto relative aspect-video overflow-hidden">
        <div className="w-full container mx-auto">
          <Toolbar
            className="w-full"
            videoStatus={videoStatus}
            detectingStatus={detectingStatus.value}
            onToggleRecording={onToggleRecording}
            toggleWebcam={toggleWebcamPaused}
            toggleDetecting={() => isDetecting.set((v) => !v)}
            isRecording={!!recordingID.value}
            recordingStatus={recordingStatus}
            cycleCamera={MediaStreamService.cycleCamera}
          />
        </div>
      </div>
    </div>
  )
}

const drawPoseToCanvas = (
  canvasCtxRef: React.MutableRefObject<CanvasRenderingContext2D | undefined>,
  canvasRef: RefObject<HTMLCanvasElement>,
  poseLandmarks: NormalizedLandmarkList
) => {
  if (!canvasCtxRef.current || !canvasRef.current) return

  //draw!!!
  canvasCtxRef.current.save()
  canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  canvasCtxRef.current.globalCompositeOperation = 'source-over'

  // Pose Connections
  drawConnectors(canvasCtxRef.current, poseLandmarks, POSE_CONNECTIONS, {
    color: '#fff',
    lineWidth: 4
  })
  // Pose Landmarks
  drawLandmarks(canvasCtxRef.current, poseLandmarks, {
    color: '#fff',
    radius: 2
  })

  // // Left Hand Connections
  // drawConnectors(
  //   canvasCtxRef.current,
  //   leftHandLandmarks !== undefined ? leftHandLandmarks : [],
  //   HAND_CONNECTIONS,
  //   {
  //     color: '#fff',
  //     lineWidth: 4
  //   }
  // )

  // // Left Hand Landmarks
  // drawLandmarks(canvasCtxRef.current, leftHandLandmarks !== undefined ? leftHandLandmarks : [], {
  //   color: '#fff',
  //   radius: 2
  // })

  // // Right Hand Connections
  // drawConnectors(
  //   canvasCtxRef.current,
  //   rightHandLandmarks !== undefined ? rightHandLandmarks : [],
  //   HAND_CONNECTIONS,
  //   {
  //     color: '#fff',
  //     lineWidth: 4
  //   }
  // )

  // // Right Hand Landmarks
  // drawLandmarks(canvasCtxRef.current, rightHandLandmarks !== undefined ? rightHandLandmarks : [], {
  //   color: '#fff',
  //   radius: 2
  // })

  // // Face Connections
  // drawConnectors(canvasCtxRef.current, faceLandmarks, FACEMESH_TESSELATION, {
  //   color: '#fff',
  //   lineWidth: 1
  // })
  // Face Landmarks
  // drawLandmarks(canvasCtxRef.current, faceLandmarks, {
  //   color: '#fff',
  //   lineWidth: 1
  // })
  canvasCtxRef.current.restore()
}

const VideoPlayback = (props: {
  startTime: number
  video: StaticResourceType
  mocap: StaticResourceType | undefined
}) => {
  const { video, mocap, startTime } = props
  const videoSrc = video.url

  const mocapData = useHookstate(null as null | ReturnType<typeof receiveResults>[])

  useEffect(() => {
    if (!mocap) return

    // todo get data from ECSRecordingSystem instead of fetching again here
    fetch(mocap.url).then((res) => {
      res.arrayBuffer().then((buffer) => {
        const rawData = decode(new Uint8Array(buffer)) as DataChannelFrame<ReturnType<typeof receiveResults>>[]
        const data = rawData.map((frame) => frame.data).flat()
        mocapData.set(data)
      })
    })
  }, [])

  const currentTimeSeconds = useHookstate(getMutableState(PlaybackState).currentTime)

  const { videoRef, canvasRef, canvasCtxRef, resizeCanvas } = useResizableVideoCanvas()

  const { handlePositionChange } = useScrubbableVideo(videoRef)

  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.addEventListener('loadedmetadata', () => {
      resizeCanvas()
      videoRef.current!.play()
      canvasCtxRef.current = canvasRef.current!.getContext('2d')!
    })
  }, [videoRef.current])

  useEffect(() => {
    if (!videoRef.current || typeof currentTimeSeconds.value !== 'number') return

    handlePositionChange(currentTimeSeconds.value)

    if (mocapData.value) {
      // start time is the time the recording was started
      const relativeTime = startTime + currentTimeSeconds.value * 1000
      // get last frame before current time
      const closest = mocapData.get(NO_PROXY)!.findLast((curr) => curr.timestamp - relativeTime <= 0)
      if (!closest) return
      drawPoseToCanvas(canvasCtxRef, canvasRef, closest.results.poseLandmarks)
    }
  }, [currentTimeSeconds])

  return (
    <>
      <div className="absolute w-full h-full top-0 left-0 items-center bg-black">
        <div className="relative">
          <Video ref={videoRef} src={videoSrc} controls={false} className={twMerge('w-full h-auto opacity-100')} />
        </div>
      </div>
      <div className="object-contain absolute top-0 left-0 z-1 min-w-full h-auto pointer-events-none">
        <Canvas ref={canvasRef} />
      </div>
    </>
  )
}

const PlaybackMode = () => {
  const recordingID = useHookstate(getMutableState(PlaybackState).recordingID)
  const currentTime = useHookstate(getMutableState(PlaybackState).currentTime)

  const recording = useGet(recordingPath, recordingID.value!)
  console.log({ recording })

  const setCurrentTime = (time) => {
    currentTime.set(time)
  }

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
        <div className="w-full h-auto relative aspect-video overflow-hidden">
          {videoPlaybackPairs.map((r) => (
            <VideoPlayback startTime={startTime} {...r} key={r.video.id} />
          ))}
        </div>
        <ReactSlider
          className="w-full h-4 my-2 bg-gray-300 rounded-lg cursor-pointer"
          min={0}
          max={durationSeconds}
          step={1 / 60} // todo store recording framerate in recording
          onChange={setCurrentTime}
          renderThumb={(props, state) => {
            return (
              <div
                {...props}
                className="w-8 h-4 bg-white rounded-full shadow-md text-center font=[lato] font-bold text-sm"
              >
                {Math.round(state.valueNow)}
              </div>
            )
          }}
        />
      </>
    )
  }

  const NoRecording = () => {
    return (
      <div className="w-full h-auto relative aspect-video overflow-hidden flex items-center justify-center bg-black">
        <h1 className="text-2xl">No Recording Selected</h1>
      </div>
    )
  }

  return (
    <div className="w-full container mx-auto pointer-events-auto">
      <div className="w-full h-auto px-2">{recording.data ? <ActiveRecording /> : <NoRecording />}</div>
      <div className="w-full container mx-auto flex">
        <div className="w-full relative m-2">
          <RecordingsList
            {...{
              startPlayback,
              stopPlayback: ECSRecordingFunctions.stopPlayback
            }}
          />
        </div>
      </div>
    </div>
  )
}

const CaptureDashboard = () => {
  const mode = useHookstate<'playback' | 'capture'>('playback')

  return (
    <div className="w-full container mx-auto max-w-[1024px] overflow-hidden">
      <Drawer settings={<div></div>}>
        <Header mode={mode} />
        {mode.value === 'playback' ? <PlaybackMode /> : <CaptureMode />}
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
