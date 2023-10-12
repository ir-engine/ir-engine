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

import React, { useCallback, useEffect } from 'react'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'

import { FullscreenContext } from '@etherealengine/client-core/src/components/useFullscreen'
import { iOS } from '@etherealengine/engine/src/common/functions/isMobile'
import { useHookstate } from '@etherealengine/hyperflux'

type Props = { children: JSX.Element | JSX.Element[] }

const FullscreenContainer = React.forwardRef((props: Props, ref: any) => {
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

FullscreenContainer.displayName = 'FullscreenContainer'

FullscreenContainer.defaultProps = {
  children: <div>FullscreenContainer</div>
}
export default FullscreenContainer
