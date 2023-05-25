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
