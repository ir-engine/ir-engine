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

import { ECSRecordingFunctions } from '@etherealengine/engine/src/ecs/ECSRecording'
import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'
import { State, useHookstate } from '@hookstate/core'
import React, { useEffect, useRef } from 'react'
import { useMediaNetwork } from '../../common/services/MediaInstanceConnectionService'
import { RecordingFunctions, RecordingState } from '../../recording/RecordingService'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { PlayIcon, PlusCircleIcon, StopIcon } from '@heroicons/react/24/solid'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { startPlayback } from '@etherealengine/ui/src/pages/Capture'
import { PeerMediaChannelState, PeerMediaStreamInterface } from '../../transports/PeerMediaChannelState'

/**
 * Record
 * - For each peer
 *    - For each [Avatar, Video, Audio, Mocap]
 *      - enable / disable
 *
 * Playback
 *  - List recordings
 *    - Open recording
 *      - For each peer
 *        - For each [Avatar, Video, Audio, Mocap]
 *          - enable / disable
 */

export const RecordingSchemaState = defineState({
  name: 'RecordingSchemaState',
  initial: {
    user: {
      Avatar: false
    },
    peers: {} as Record<PeerID, Record<'Video' | 'Audio' | 'Mocap', boolean>>
  }
})

const PeerRecordOptions = ['Video', 'Audio', 'Mocap'] as const

export const RecordingPeer = (props: { peerID: PeerID }) => {
  const { peerID } = props

  const recordingSchemaState = useHookstate(getMutableState(RecordingSchemaState))

  useEffect(() => {
    if (!recordingSchemaState.peers.value[peerID]) {
      recordingSchemaState.peers.merge({
        [peerID]: {
          Video: false,
          Audio: false,
          Mocap: false
        }
      })
    }
  }, [])

  const onCheck = (option: (typeof PeerRecordOptions)[number]) => {
    recordingSchemaState.peers[peerID][option].set(!recordingSchemaState.peers[peerID][option].value)
  }

  const peerMediaChannelState = useHookstate(
    getMutableState(PeerMediaChannelState)[peerID]['cam'] as State<PeerMediaStreamInterface>
  )
  const { videoStream: videoStreamState } = peerMediaChannelState

  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!ref.current || ref.current.srcObject || !videoStreamState?.value) return

    ref.current.id = `${peerID}_video_xrui`
    ref.current.autoplay = true
    ref.current.muted = true
    ref.current.setAttribute('playsinline', 'true')

    const newVideoTrack = videoStreamState.value.track!.clone()
    ref.current.srcObject = new MediaStream([newVideoTrack])
    ref.current.play()
  }, [ref.current, videoStreamState])

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row' }} className="flex flex-row">
        <div style={{ display: 'flex', flexDirection: 'column' }} className="flex flex-col">
          {PeerRecordOptions.map((option) => (
            <div key={option} style={{ display: 'flex', flexDirection: 'row' }} className="flex flex-row">
              <input
                type="checkbox"
                checked={recordingSchemaState.peers.value[peerID]?.[option] ?? false}
                onChange={() => onCheck(option)}
              />
              <label>{option}</label>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }} className="flex flex-col">
          {videoStreamState.value && recordingSchemaState.peers.value[peerID]?.Video && (
            <video
              xr-layer="true"
              style={{ maxWidth: '100px', width: '100%', height: 'auto' }}
              playsInline={true}
              autoPlay={true}
              ref={ref as any}
            />
          )}
        </div>
      </div>
    </>
  )
}

export const RecordingPeerList = () => {
  const mediaNetworkState = useMediaNetwork()
  const peerMediaChannelState = useHookstate(getMutableState(PeerMediaChannelState))
  const recordingSchemaState = useHookstate(getMutableState(RecordingSchemaState))

  const peerIDs = useHookstate([] as PeerID[])

  const onCheckAvatar = () => {
    recordingSchemaState.user.Avatar.set(!recordingSchemaState.user.Avatar.value)
  }

  useEffect(() => {
    if (!mediaNetworkState?.users) return
    peerIDs.set(mediaNetworkState.users.value.get(Engine.instance.userId) ?? [])
  }, [mediaNetworkState?.peers, mediaNetworkState?.users])

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <table style={{ display: 'table', width: '100%' }}>
        <thead>
          <tr>
            <th>Peer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <div key={'avatar'} style={{ display: 'flex', flexDirection: 'row' }} className="flex flex-row">
            <input type="checkbox" checked={recordingSchemaState.user.Avatar.value} onChange={() => onCheckAvatar()} />
            <label>{'Avatar'}</label>
          </div>
          {peerIDs.value
            .filter((peerID) => peerMediaChannelState[peerID].value)
            .map((peerID) => (
              <tr key={peerID}>
                <td>
                  <div style={{ width: '200px', overflowWrap: 'break-word' }} className="bg-grey">
                    {peerID}
                  </div>
                </td>
                <td>
                  <div className="">
                    {/* a button to play back the recording */}
                    <RecordingPeer peerID={peerID} />
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

const RecordingsList = () => {
  const recordingState = useHookstate(getMutableState(RecordingState))

  useEffect(() => {
    RecordingFunctions.getRecordings()
  }, [])

  return (
    <div style={{ width: '100%' }}>
      <table style={{ display: 'table', width: '100%' }}>
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
                  {recordingState.playback.value === recording.id ? (
                    <button
                      onClick={() => {
                        ECSRecordingFunctions.stopPlayback({
                          recordingID: recording.id
                        })
                      }}
                    >
                      <StopIcon
                        style={{ display: 'block', width: '24px', height: '24px' }}
                        className="block min-w-6 min-h-6"
                      />
                    </button>
                  ) : (
                    <>
                      <button className="btn btn-ghost" onClick={() => startPlayback(recording.id, false)}>
                        <PlayIcon
                          style={{ display: 'block', width: '24px', height: '24px' }}
                          className="block min-w-6 min-h-6"
                        />
                      </button>
                      <button onClick={() => startPlayback(recording.id, true)}>
                        <PlusCircleIcon
                          style={{ display: 'block', width: '24px', height: '24px' }}
                          className="block min-w-6 min-h-6"
                        />
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
  const mode = useHookstate('create' as 'create' | 'playback')
  const recordingState = useHookstate(getMutableState(RecordingState))

  const onToggleRecording = () => {
    if (recordingState.recordingID.value) {
      ECSRecordingFunctions.stopRecording({
        recordingID: recordingState.recordingID.value
      })
      RecordingFunctions.getRecordings()
    } else if (!recordingState.started.value) {
      RecordingFunctions.startRecording(getState(RecordingSchemaState)).then((recordingID) => {
        if (recordingID) ECSRecordingFunctions.startRecording({ recordingID })
      })
    }
  }

  const recordingStatus = !recordingState?.recordingID?.value
    ? 'inactive'
    : recordingState?.started?.value
    ? 'active'
    : 'ready'

  return (
    <>
      <div style={{ width: '100%', position: 'relative', fontFamily: 'Roboto, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <button
            className="btn btn-ghost"
            onClick={() => {
              mode.set(mode.value === 'create' ? 'playback' : 'create')
            }}
          >
            {mode.value === 'create' ? 'Playback' : 'Create'}
          </button>
          {mode.value === 'create' && (
            <button
              className="btn btn-ghost"
              onClick={() => {
                onToggleRecording()
              }}
            >
              {recordingStatus === 'inactive' ? 'Record' : recordingStatus === 'active' ? 'Recording' : 'Stop'}
            </button>
          )}
        </div>
        {mode.value === 'create' ? <RecordingPeerList /> : <RecordingsList />}
      </div>
    </>
  )
}
