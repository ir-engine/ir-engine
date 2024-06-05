import { ProgressBarState } from '@etherealengine/client-core/src/common/services/ProgressBarState'
import { NO_PROXY, useMutableState } from '@etherealengine/hyperflux'
import React from 'react'

export const EditorProgressBar = () => {
  const progressBarState = useMutableState(ProgressBarState)
  return <>{Object.values(progressBarState.get(NO_PROXY)).map((element) => element)}</>
}
