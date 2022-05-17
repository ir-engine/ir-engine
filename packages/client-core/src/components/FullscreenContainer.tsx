import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'

import { FullscreenContext } from '@xrengine/client-core/src/components/useFullscreen'

type Props = { children: JSX.Element | JSX.Element[] }

export const FullscreenContainer = (props: Props) => {
  const [fullScreenActive, setFullScreenActive] = useState(false)
  const handle = useFullScreenHandle()

  const reportChange = useCallback((state) => {
    if (state) {
      setFullScreenActive(state)
    } else {
      setFullScreenActive(state)
    }
  }, [])

  useEffect(() => {
    if (fullScreenActive) handle.enter()
    else handle.exit()
  }, [fullScreenActive])

  return (
    <FullscreenContext.Provider value={[fullScreenActive, setFullScreenActive]}>
      <FullScreen handle={handle} onChange={reportChange}>
        {props.children}
      </FullScreen>
    </FullscreenContext.Provider>
  )
}
