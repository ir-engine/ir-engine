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

import { PlayIcon, PlusCircleIcon, StopIcon } from '@heroicons/react/24/solid'
import React from 'react'

const RecordingsList = ({ startPlayback, stopPlayback, recordingState }) => {
  return (
    <div className="w-full aspect-video overflow-hidden">
      <table className="table w-full">
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
          ))}
        </tbody>
      </table>
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
