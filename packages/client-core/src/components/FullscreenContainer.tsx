import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'

import { FullscreenContext } from '@xrengine/client-core/src/components/useFullscreen'

type Props = { children: JSX.Element | JSX.Element[] }

export const FullscreenContainer = React.forwardRef((props: Props, ref: any) => {
  const [fullScreenActive, setFullScreenActive] = useState(false)
  const handle = useFullScreenHandle()

  useEffect(() => {
    if (ref?.current) {
      const canvas = document.getElementById('engine-renderer-canvas')!
      document.body.removeChild(canvas)
      ref.current.appendChild(canvas)
    }
  }, [ref])

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
        <div id={'engine-container'} ref={ref}>
          {props.children}
        </div>
      </FullScreen>
    </FullscreenContext.Provider>
  )
})
