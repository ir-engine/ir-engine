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

import { ECSRecordingFunctions, startPlayback } from '@etherealengine/engine/src/ecs/ECSRecording'
import { getMutableState } from '@etherealengine/hyperflux'
import { useHookstate } from '@hookstate/core'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useMediaInstance } from '../../common/services/MediaInstanceConnectionService'
import { RecordingFunctions, RecordingState } from '../../recording/RecordingService'
import { MediaStreamState } from '../../transports/MediaStreams'
import { toggleWebcamPaused } from '../../transports/SocketWebRTCClientFunctions'

import { PlayIcon, PlusCircleIcon, StopIcon } from '@heroicons/react/24/solid'

const RecordingsList = ({ startPlayback, stopPlayback, recordingState }) => {
  return (
    <div style={{ width: '100%', aspectRatio: '16 / 9', overflow: 'hidden' }}>
      <table style={{ display: 'table', width: '100%' }}>
        {/* head */}
        <thead>
          <tr>
            <th>Recording</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recordingState.recordings.value.map((recording) => (
            <tr key={recording.id}>
              <td>
                <div className="bg-grey">{recording.id}</div>
              </td>
              <td>
                <div key={recording.id} className="">
                  {/* a button to play back the recording */}
                  {recordingState.playback.value === recording.id ? (
                    <button
                      onClick={() => {
                        stopPlayback({
                          recordingID: recording.id
                        })
                      }}
                    >
                      <StopIcon className="block min-w-6 min-h-6" />
                    </button>
                  ) : (
                    <>
                      <button className="btn btn-ghost" onClick={() => startPlayback(recording.id, false)}>
                        <PlayIcon className="block min-w-6 min-h-6" />
                      </button>
                      <button style={{ pointerEvents: 'all' }} onClick={() => startPlayback(recording.id, true)}>
                        <PlusCircleIcon className="block min-w-6 min-h-6" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const RecordingsWidgetUI = () => {
  const [isVideoFlipped, setIsVideoFlipped] = useState(true)

  const videoRef = useRef<HTMLVideoElement>()
  console.log(videoRef)
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

  // useEffect(() => {
  //   window.addEventListener('resize', resizeCanvas)
  //   return () => {
  //     window.removeEventListener('resize', resizeCanvas)
  //   }
  // }, [])

  useEffect(() => {
    RecordingFunctions.getRecordings()
  }, [])

  useEffect(() => {
    if (!videoRef.current) return
    const factor = isVideoFlipped === true ? '-1' : '1'
    // canvasRef.current!.style.transform = `scaleX(${factor})`
    videoRef.current!.style.transform = `scaleX(${factor})`
  }, [isVideoFlipped, videoRef])

  useLayoutEffect(() => {
    if (!videoRef.current) return
    // canvasCtxRef.current = canvasRef.current!.getContext('2d')!
    videoRef.current!.srcObject = videoStream.value
    videoRef.current!.onplay = () => videoActive.set(true)
    videoRef.current!.onpause = () => videoActive.set(false)
    // resizeCanvas()
  }, [videoRef, videoStream])

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
  const recordingStatus = !recordingState?.recordingID?.value // && isDetecting?.value !== true
    ? 'inactive'
    : recordingState?.started?.value
    ? 'active'
    : 'ready'

  return (
    <>
      <div style={{ width: '100%', height: 'auto', margin: '0px auto', padding: '0px 2px' }}>
        <div style={{ width: '100%', height: 'auto', position: 'relative', paddingBottom: '56.25%' }}>
          {videoStream && (
            <div
              style={{
                width: '100%',
                height: 'auto',
                position: 'absolute',
                top: '0px',
                left: '0px',
                backgroundColor: '#000000'
              }}
            >
              <video
                xr-layer="true"
                style={{ maxWidth: '100px', width: '100%', height: 'auto' }}
                playsInline={true}
                autoPlay={true}
                ref={videoRef as any}
              />
            </div>
          )}
          {videoStatus !== 'active' ? (
            <button
              onClick={() => {
                if (mediaConnection?.connected?.value) toggleWebcamPaused()
              }}
              style={{
                position: 'absolute',
                border: 'none',
                backgroundColor: 'transparent',
                height: '100%',
                width: '100%',
                margin: '0px auto',
                padding: '0px',
                top: '0px',
                left: '0px'
              }}
            >
              <h1>{mediaConnection?.connected?.value ? 'Enable Camera' : 'Loading...'}</h1>
            </button>
          ) : null}
        </div>
      </div>
      <div style={{ width: '100%', height: 'auto', margin: '0px auto' }}></div>
      <div style={{ width: '100%', position: 'relative' }}>
        <RecordingsList
          {...{
            startPlayback,
            stopPlayback: ECSRecordingFunctions.stopPlayback,
            recordingState
          }}
        />
      </div>
    </>
  )
}
