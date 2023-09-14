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

import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { PlaybackState } from '@etherealengine/engine/src/recording/ECSRecordingSystem'
import {
  RecordingID,
  RecordingType,
  recordingPath
} from '@etherealengine/engine/src/schemas/recording/recording.schema'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { PlayIcon, PlusCircleIcon, StopIcon } from '@heroicons/react/24/solid'
import React from 'react'
import Icon from '../../../primitives/mui/Icon'
import IconButtonWithTooltip from '../../../primitives/mui/IconButtonWithTooltip'

function formatHHMMSS(time) {
  const sec_num = parseInt(time, 10) // don't forget the second param
  const hours = Math.floor(sec_num / 3600)
  const minutes = Math.floor((sec_num - hours * 3600) / 60)
  const seconds = sec_num - hours * 3600 - minutes * 60

  const hoursString = hours < 10 ? '0' + hours : hours.toString()
  const minutesString = minutes < 10 ? '0' + minutes : minutes.toString()
  const secondsString = seconds < 10 ? '0' + seconds : seconds.toString()

  return hoursString + ':' + minutesString + ':' + secondsString
}

const sortByNewest = (a, b) => {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

const RecordingsList = (props: {
  startPlayback: (recordingID: RecordingID, twin: boolean) => void
  stopPlayback: (args: { recordingID: RecordingID }) => void
}) => {
  const { startPlayback, stopPlayback } = props

  const recordingID = useHookstate(getMutableState(PlaybackState).recordingID)
  const recording = useFind(recordingPath, {
    query: { $sort: { createdAt: -1 }, $limit: 10, $skip: 0 }
  })

  const sortedRecordings = recording.data.sort(sortByNewest)

  const RecordingItem = (props: { recording: RecordingType }) => {
    const { recording } = props
    const hasEntityResource = recording.resources.some((resource) => resource.key?.includes('entities'))
    const hasVideoResource = recording.resources.some((resource) => resource.mimeType?.includes('video'))
    const hasMocapResource = recording.resources.some((resource) => resource.key?.includes('mocap'))
    return (
      <tr key={recording.id}>
        <td>
          <div className="bg-grey">{recording.id}</div>
        </td>
        <td>
          {/* icon for each media type */}
          <div className="bg-grey flex flex-row">
            {hasEntityResource && (
              <div className="bg-grey">
                <IconButtonWithTooltip id="Entity" title={'Entity'} icon={<Icon type={'Accessibility'} />} />
              </div>
            )}
            {hasVideoResource && (
              <div className="bg-grey">
                <IconButtonWithTooltip id="Video" title={'Video'} icon={<Icon type={'Videocam'} />} />
              </div>
            )}
            {hasMocapResource && (
              <div className="bg-grey">
                <IconButtonWithTooltip id="Mocap" title={'Mocap'} icon={<Icon type={'DirectionsRun'} />} />
              </div>
            )}
          </div>
        </td>
        <td>
          <div className="bg-grey">{new Date(recording.createdAt).toLocaleTimeString()}</div>
        </td>
        <td>
          <div className="bg-grey">
            {formatHHMMSS((new Date(recording.updatedAt).getTime() - new Date(recording.createdAt).getTime()) / 1000)}
          </div>
        </td>
        <td>
          <div key={recording.id} className="">
            {/* a button to play back the recording */}
            {recordingID.value === recording.id ? (
              <button
                className="btn btn-ghost"
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
    )
  }

  return (
    <div className="w-full aspect-video">
      <table className="table w-full">
        {/* head */}
        <thead>
          <tr>
            <th>Recording</th>
            <th>Media</th>
            <th>Created At</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecordings.map((recording) => (
            <RecordingItem key={recording.id} recording={recording} />
          ))}
        </tbody>
      </table>
      <div className="flex justify-between">
        <button
          className="btn btn-ghost"
          disabled={recording.skip <= 0}
          onClick={() => {
            recording.previous()
          }}
        >
          Prev
        </button>
        <div className="flex items-center justify-center">
          {recording.skip / recording.limit + 1} of {Math.ceil(recording.total / recording.limit)}
        </div>
        <button
          className="btn btn-ghost"
          disabled={recording.skip + recording.limit >= recording.total}
          onClick={() => {
            recording.next()
          }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

RecordingsList.displayName = 'RecordingsList'
RecordingsList.defaultProps = {
  startPlayback: () => {},
  stopPlayback: () => {},
  recordingState: {}
}

export default RecordingsList
