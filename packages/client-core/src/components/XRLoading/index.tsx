import React from 'react'

import { XRState } from '@xrengine/engine/src/xr/XRState'
import { getState, useHookstate } from '@xrengine/hyperflux'

import { LoadingCircle } from '../LoadingCircle'

export const XRLoading = () => {
  const xrState = useHookstate(getState(XRState))
  return xrState.requestingSession.value ? <LoadingCircle /> : <></>
}
