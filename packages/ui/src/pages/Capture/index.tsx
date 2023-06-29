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

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useHookstate } from '@hookstate/core'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import {
  FACEMESH_TESSELATION,
  HAND_CONNECTIONS,
  Holistic,
  NormalizedLandmarkList,
  Options,
  POSE_CONNECTIONS
} from '@mediapipe/holistic'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

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
    // maxPacketLifeTime: 0,
    maxRetransmits: 1,
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
  const [isVideoFlipped, setIsVideoFlipped] = useState(true)
  const [isDrawingBody, setIsDrawingBody] = useState(true)
  const [isDrawingHands, setIsDrawingHands] = useState(true)
  const [isDrawingFace, setIsDrawingFace] = useState(true)

  const isDetecting = useHookstate(false)
  const [detectingStatus, setDetectingStatus] = useState('inactive')

  const detector = useHookstate(null as null | Holistic)
  const poseOptions = useHookstate({
    enableFaceGeometry: isDrawingFace,
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

  const resizeCanvas = () => {
    canvasRef.current!.width = videoRef.current!.clientWidth
    canvasRef.current!.height = videoRef.current!.clientHeight
  }

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas)
    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  useEffect(() => {
    RecordingFunctions.getRecordings()
  }, [])

  useEffect(() => {
    const factor = isVideoFlipped === true ? '-1' : '1'
    canvasRef.current!.style.transform = `scaleX(${factor})`
    videoRef.current!.style.transform = `scaleX(${factor})`
  }, [isVideoFlipped])

  useLayoutEffect(() => {
    canvasCtxRef.current = canvasRef.current!.getContext('2d')!
    videoRef.current!.srcObject = videoStream.value
    videoRef.current!.onplay = () => videoActive.set(true)
    videoRef.current!.onpause = () => videoActive.set(false)
    resizeCanvas()
  }, [videoStream, poseOptions.selfieMode])

  useEffect(() => {
    detector.value?.setOptions(poseOptions.value)
  }, [detector, poseOptions])

  useEffect(() => {
    if (!isDetecting?.value) return

    if (!detector.value) {
      if (Holistic !== undefined) {
        setDetectingStatus('loading')
        const holistic = new Holistic({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
          }
        })
        detector.set(holistic)
      }
    }

    processingFrame.set(false)

    if (detector.value) {
      detector.value.onResults((results) => {
        if (detectingStatus !== 'active') setDetectingStatus('active')

        const { poseLandmarks, faceLandmarks, leftHandLandmarks, rightHandLandmarks } = results

        /**
         * Holistic model currently has no export for poseWorldLandmarks, instead as za (likely to change for new builds of the package)
         * See https://github.com/google/mediapipe/issues/3155
         */
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        sendResults(results.za)

        processingFrame.set(false)

        if (!canvasCtxRef.current || !canvasRef.current || !poseLandmarks) return

        //draw!!!
        canvasCtxRef.current.save()
        canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        canvasCtxRef.current.globalCompositeOperation = 'source-over'

        if (isDrawingBody) {
          // Pose Connections
          drawConnectors(canvasCtxRef.current, poseLandmarks, POSE_CONNECTIONS, {
            color: '#fff',
            lineWidth: 4
          })
          // Pose Landmarks
          drawLandmarks(canvasCtxRef.current, poseLandmarks, {
            color: '#fff',
            lineWidth: 2
          })
        }

        if (isDrawingHands) {
          // Left Hand Connections
          drawConnectors(
            canvasCtxRef.current,
            leftHandLandmarks !== undefined ? leftHandLandmarks : [],
            HAND_CONNECTIONS,
            {
              color: '#fff',
              lineWidth: 4
            }
          )

          // Left Hand Landmarks
          drawLandmarks(canvasCtxRef.current, leftHandLandmarks !== undefined ? leftHandLandmarks : [], {
            color: '#fff',
            lineWidth: 2
          })

          // Right Hand Connections
          drawConnectors(
            canvasCtxRef.current,
            rightHandLandmarks !== undefined ? rightHandLandmarks : [],
            HAND_CONNECTIONS,
            {
              color: '#fff',
              lineWidth: 4
            }
          )

          // Right Hand Landmarks
          drawLandmarks(canvasCtxRef.current, rightHandLandmarks !== undefined ? rightHandLandmarks : [], {
            color: '#fff',
            lineWidth: 2
          })
        }

        if (isDrawingFace) {
          // Face Connections
          drawConnectors(canvasCtxRef.current, faceLandmarks, FACEMESH_TESSELATION, {
            color: '#fff',
            lineWidth: 2
          })
          // Face Landmarks
          // drawLandmarks(canvasCtxRef.current, faceLandmarks, {
          //   color: '#fff',
          //   lineWidth: 1
          // })
        }
        canvasCtxRef.current.restore()
      })
    }

    return () => {
      setDetectingStatus('inactive')
      if (detector.value) {
        detector.value.close()
      }
      detector.set(null)
    }
  }, [isDetecting])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useVideoFrameCallback(videoRef.current, (videoTime, metadata) => {
    resizeCanvas()

    if (processingFrame.value) return

    if (detector.value) {
      processingFrame.set(true)
      detector.value?.send({ image: videoRef.current! }).finally(() => {
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
    mediaStreamState?.camVideoProducer?.value !== null && mediaStreamState?.videoPaused?.value === false
  const videoStatus =
    !mediaConnection?.connected?.value && !videoActive?.value
      ? 'loading'
      : isCamVideoEnabled !== true
      ? 'ready'
      : 'active'
  const recordingStatus =
    !recordingState?.recordingID?.value && isDetecting?.value !== true
      ? 'inactive'
      : recordingState?.started?.value
      ? 'active'
      : 'ready'

  return (
    <div className="w-full container mx-auto pointer-events-auto">
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
        <div className="w-full container mx-auto">
          <div className="w-full h-auto px-2">
            <div className="w-full h-auto relative aspect-w-16 aspect-h-9 overflow-hidden">
              <div className="absolute w-full h-auto top-0 left-0" style={{ backgroundColor: '#000000' }}>
                <Video ref={videoRef} className="w-full h-auto" />
              </div>
              <div
                className="object-contain absolute top-0 left-0 z-20 min-w-full h-auto"
                style={{ objectFit: 'contain', top: '0px' }}
              >
                <Canvas ref={canvasRef} />
              </div>
              {videoStatus !== 'active' ? (
                <button
                  onClick={() => {
                    if (mediaConnection?.connected?.value) toggleWebcamPaused()
                  }}
                  className="absolute btn btn-ghost bg-none h-full w-full container mx-auto m-0 p-0 top-0 left-0"
                >
                  <h1>{mediaConnection?.connected?.value ? 'Enable Camera' : 'Loading...'}</h1>
                </button>
              ) : null}
            </div>
          </div>
          <div className="w-full container mx-auto">
            <Toolbar
              className="w-full"
              videoStatus={videoStatus}
              detectingStatus={detectingStatus}
              onToggleRecording={onToggleRecording}
              toggleWebcam={toggleWebcamPaused}
              toggleDetecting={() => isDetecting.set((v) => !v)}
              isRecording={recordingState?.started?.value}
              recordingStatus={recordingStatus}
              isVideoFlipped={isVideoFlipped}
              flipVideo={(v) => {
                setIsVideoFlipped(v)
              }}
              cycleCamera={MediaStreamService.cycleCamera}
              isDrawingBody={isDrawingBody}
              drawBody={(v) => {
                setIsDrawingBody(v)
              }}
              isDrawingHands={isDrawingHands}
              drawHands={(v) => {
                setIsDrawingHands(v)
              }}
              isDrawingFace={isDrawingFace}
              drawFace={(v) => {
                setIsDrawingFace(v)
              }}
            />
          </div>
          <div className="w-full container mx-auto">
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
