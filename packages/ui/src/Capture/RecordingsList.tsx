import { useHookstate } from '@hookstate/core'
import React from 'react'

import { RecordingState } from '@etherealengine/client-core/src/recording/RecordingService'
import { getMutableState } from '@etherealengine/hyperflux'

const RecordingsList = () => {
  const recordingState = useHookstate(getMutableState(RecordingState))
  return (
    <div>
      {recordingState?.recordings?.value.map((recording) => (
        <div key={recording.id} className="bg">
          {recording.id}
        </div>
      ))}
    </div>
  )
}

export default RecordingsList
