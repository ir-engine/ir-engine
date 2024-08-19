/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect, useRef } from 'react'
import { HiPlay, HiPlusCircle } from 'react-icons/hi2'

import { recordingPath, RecordingType } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { ECSRecordingActions, PlaybackState, RecordingState } from '@ir-engine/engine/src/recording/ECSRecordingSystem'
import { defineState, getMutableState, getState, PeerID, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'
import { useFind, useGet } from '@ir-engine/spatial/src/common/functions/FeathersHooks'
import { WidgetAppService } from '@ir-engine/spatial/src/xrui/WidgetAppService'
import { startPlayback } from '@ir-engine/ui/src/pages/Capture'

import { useMediaNetwork } from '../../common/services/MediaInstanceConnectionService'
import { PeerMediaChannelState } from '../../transports/PeerMediaChannelState'

// TODO replace these templates with our generalised ones for XRUI
const Checkbox = (props: { label: string; disabled?: boolean; checked: boolean; onChange: () => void }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }} className="flex flex-row">
      <input
        type="checkbox"
        style={{ margin: 0, width: '20px', height: '20px' }}
        checked={props.checked}
        disabled={props.disabled}
        onChange={() => {
          props.onChange()
        }}
      />
      <label>{props.label}</label>
    </div>
  )
}

const Button = (props: { label: string | JSX.Element; onClick: () => void }) => {
  return (
    <button
      style={{
        margin: 0,
        padding: '6px 12px',
        border: '0px',
        borderRadius: '20px',
        color: 'var(--buttonTextColor)',
        fontSize: '14px',
        background: 'linear-gradient(90deg, var(--buttonGradientStart), var(--buttonGradientEnd))'
      }}
      onClick={props.onClick}
    >
      {props.label}
    </button>
  )
}

const VideoPreview = (props: { peerID: PeerID }) => {
  const { peerID } = props

  const peerMediaChannelState = useMutableState(PeerMediaChannelState)[peerID]['cam']

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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {videoStreamState.value && (
        <video
          xr-layer="true"
          style={{ maxWidth: '100px', width: '100%', height: 'auto' }}
          playsInline={true}
          autoPlay={true}
          ref={ref as any}
        />
      )}
    </div>
  )
}

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

  const recordingSchemaState = useMutableState(RecordingSchemaState)

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

  const RenderOption = (props: { option: (typeof PeerRecordOptions)[number] }) => {
    const { option } = props
    // TODO figure out how to detect if the various data channels are available
    const disabled = false // (option === 'Video' && !videoStreamState.value) || (option === 'Audio' && !peerMediaChannelState.audioStream.value)// || // (option === 'Mocap' && !peerMediaChannelState.mocapStream.value)
    return (
      <Checkbox
        label={option}
        disabled={disabled}
        checked={recordingSchemaState.peers.value[peerID]?.[option] ?? false}
        onChange={() => onCheck(option)}
      />
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row' }} className="flex flex-row">
        <div style={{ display: 'flex', flexDirection: 'column' }} className="flex flex-col">
          {PeerRecordOptions.map((option) => (
            <RenderOption key={option} option={option} />
          ))}
        </div>
        <VideoPreview peerID={peerID} />
      </div>
    </>
  )
}

export const RecordingPeerList = () => {
  const mediaNetworkState = useMediaNetwork()
  const peerMediaChannelState = useMutableState(PeerMediaChannelState)
  const recordingSchemaState = useMutableState(RecordingSchemaState)

  const recordingState = useMutableState(RecordingState)

  const onToggleRecording = () => {
    if (recordingState.recordingID.value) {
      RecordingState.stopRecording({
        recordingID: recordingState.recordingID.value
      })
    } else {
      RecordingState.requestRecording(getState(RecordingSchemaState))
    }
  }

  const getRecordingStatus = () => {
    if (!recordingState.active.value) return 'ready'
    if (recordingState.startedAt.value) return 'active'
    return 'starting'
  }
  const recordingStatus = getRecordingStatus()

  const peerIDs = useHookstate([] as PeerID[])

  const onCheckAvatar = () => {
    recordingSchemaState.user.Avatar.set(!recordingSchemaState.user.Avatar.value)
  }

  useEffect(() => {
    const mediaNetwork = NetworkState.mediaNetwork
    peerIDs.set(mediaNetwork?.users?.[Engine.instance.userID] ?? [])
  }, [mediaNetworkState?.peers, mediaNetworkState?.users])

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <div
        key={'avatar'}
        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
        className="flex flex-row"
      >
        <Checkbox
          label={'Avatar'}
          disabled={false}
          checked={recordingSchemaState.user.Avatar.value}
          onChange={() => onCheckAvatar()}
        />
        <Button
          label={recordingStatus === 'ready' ? 'Record' : recordingStatus === 'starting' ? 'Starting...' : 'Recording'}
          onClick={() => onToggleRecording()}
        />
      </div>
      <table style={{ borderCollapse: 'collapse', borderSpacing: 0, display: 'table', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ padding: 0, textAlign: 'left' }} className="p-0 text-left">
              Peer
            </th>
            <th style={{ padding: 0, textAlign: 'left' }} className="p-0 text-left">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {peerIDs.value
            .filter((peerID) => peerMediaChannelState[peerID].value)
            .map((peerID) => (
              <tr key={peerID}>
                <td style={{ padding: 0, textAlign: 'left' }} className="p-0 text-left">
                  <div style={{ width: '200px', overflowWrap: 'break-word' }}>{peerID}</div>
                </td>
                <td style={{ padding: 0, textAlign: 'left' }} className="p-0 text-left">
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

export const RecordingTimer = () => {
  const recordingState = useMutableState(RecordingState)
  const currentTime = useHookstate(0)
  const seconds = Math.round((currentTime.value - recordingState.startedAt.value!) / 1000)
  const minutes = Math.floor(seconds / 60)
  const secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`
  const minutesString = minutes < 10 ? `0${minutes}` : `${minutes}`

  useEffect(() => {
    const interval = setInterval(() => {
      currentTime.set(Date.now())
    }, 100)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return <div xr-layer>{`${minutesString}:${secondsString}`}</div>
}

const RecordingPlayback = () => {
  const playbackState = useMutableState(PlaybackState)
  const recording = useGet(recordingPath, playbackState.recordingID.value!)

  useEffect(() => {
    if (!playbackState.recordingID.value)
      return () => {
        getMutableState(RecordingUIState).mode.set('recordings')
      }
    const playback = playbackState.recordingID.value
    return () => {
      getMutableState(RecordingUIState).mode.set('recordings')
      ECSRecordingActions.stopPlayback({
        recordingID: playback
      })
    }
  }, [playbackState.recordingID])

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <RecordingTimer />
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {recording.data?.resources &&
          recording.data.resources.map((resource) => {
            if (!resource.key.endsWith('.webm') && !resource.key.endsWith('.mp4')) return null
            return (
              <video
                key={resource.id}
                style={{ maxWidth: '100px', width: '100px', height: 'auto' }}
                src={resource.url}
                autoPlay={true}
                crossOrigin="anonymous"
              />
            )
          })}
      </div>
    </div>
  )
}

const RecordingsList = () => {
  const recording = useFind(recordingPath)

  const sortedRecordings = [...recording.data].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const RenderRecording = (props: { recording: RecordingType }) => {
    const { recording } = props
    const time = new Date(recording.createdAt).toLocaleTimeString()
    const duration = (new Date(recording.updatedAt).getTime() - new Date(recording.createdAt).getTime()) / 1000
    return (
      <tr key={recording.id} style={{ height: '33px' }}>
        <td style={{ padding: 0, textAlign: 'left' }} className="p-0 text-left">
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
            {recording.id}
          </div>
        </td>
        <td style={{ padding: 0, textAlign: 'left' }} className="p-0 text-left">
          <div>{time}</div>
        </td>
        <td style={{ padding: 0, textAlign: 'left' }} className="p-0 text-left">
          <div>{duration}s</div>
        </td>
        <td style={{ padding: 0, textAlign: 'left' }} className="p-0 text-left">
          <div key={recording.id} style={{ display: 'flex' }}>
            <Button
              onClick={() => {
                startPlayback(recording.id, false)
                getMutableState(RecordingUIState).mode.set('playback')
              }}
              label={
                <HiPlay style={{ display: 'block', width: '24px', height: '24px' }} className="block min-h-6 min-w-6" />
              }
            />
            <Button
              onClick={() => {
                startPlayback(recording.id, true)
                getMutableState(RecordingUIState).mode.set('playback')
              }}
              label={
                <HiPlusCircle
                  style={{ display: 'block', width: '24px', height: '24px' }}
                  className="block min-h-6 min-w-6"
                />
              }
            />
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      <table style={{ borderCollapse: 'collapse', borderSpacing: 0, display: 'table', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ padding: 0, textAlign: 'left' }} className="p-0 text-left">
              Recording
            </th>
            <th style={{ padding: 0, textAlign: 'left' }} className="p-0 text-left">
              Time
            </th>
            <th style={{ padding: 0, textAlign: 'left' }} className="p-0 text-left">
              Duration
            </th>
            <th style={{ padding: 0, textAlign: 'left' }} className="p-0 text-left">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRecordings.map((recording) => (
            <RenderRecording key={recording.id} recording={recording} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const RecordingUIState = defineState({
  name: 'RecordingUIState',
  initial: {
    mode: 'create' as 'create' | 'recordings' | 'playback'
  }
})

export const RecordingsWidgetUI = () => {
  const recordingState = useMutableState(RecordingState)
  const mode = useMutableState(RecordingUIState).mode
  return (
    <>
      <div
        style={{
          width: '100%',
          position: 'relative',
          fontFamily: 'Roboto, sans-serif',
          background: 'var(--popupBackground)',
          borderRadius: '20px',
          color: 'var(--textColor)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '16px 12px' }}>
          <Button
            onClick={() => {
              mode.set(mode.value === 'create' ? 'recordings' : 'create')
            }}
            label={
              <>
                {mode.value === 'create' && 'Recordings'}
                {mode.value === 'recordings' && 'Create'}
                {mode.value === 'playback' && 'Stop'}
              </>
            }
          />
          <Button
            onClick={() => {
              WidgetAppService.closeWidgets()
            }}
            label={'Close'}
          />
        </div>
        {mode.value === 'create' && <RecordingPeerList />}
        {mode.value === 'recordings' && <RecordingsList />}
        {mode.value === 'playback' && recordingState.recordingID.value && <RecordingPlayback />}
      </div>
    </>
  )
}
