import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'

import { FullscreenContext } from '@etherealengine/client-core/src/components/useFullscreen'
import { iOS } from '@etherealengine/engine/src/common/functions/isMobile'
import { useHookstate } from '@etherealengine/hyperflux'

type Props = { children: JSX.Element | JSX.Element[] }

export const FullscreenContainer = React.forwardRef((props: Props, ref: any) => {
  const fullScreenActive = useHookstate(false)
  const handle = useFullScreenHandle()

  useEffect(() => {
    if (ref?.current) {
      const canvas = document.getElementById('engine-renderer-canvas')!
      canvas.parentElement?.removeChild(canvas)
      ref.current.appendChild(canvas)
    }
  }, [ref])

  const reportChange = useCallback((state) => {
    if (state) {
      fullScreenActive.set(state)
    } else {
      fullScreenActive.set(state)
    }
  }, [])

  useEffect(() => {
    if (fullScreenActive.value) handle.enter()
    else handle.exit()
  }, [fullScreenActive.value])

  return iOS ? (
    <div id={'engine-container'} ref={ref}>
      {props.children}
    </div>
  ) : (
    <FullscreenContext.Provider value={[fullScreenActive.value, fullScreenActive.set]}>
      <FullScreen handle={handle} onChange={reportChange} className="border-2 border-red-700">
        {props.children}
      </FullScreen>
    </FullscreenContext.Provider>
  )
})
