import React from 'react'

import { TouchGamepad } from '@etherealengine/client-core/src/common/components/TouchGamepad'
import { ARPlacement } from '@etherealengine/client-core/src/components/ARPlacement'
import { Fullscreen } from '@etherealengine/client-core/src/components/Fullscreen'
import { InstanceChatWrapper } from '@etherealengine/client-core/src/components/InstanceChat'
import { MediaIconsBox } from '@etherealengine/client-core/src/components/MediaIconsBox'
import { Shelves } from '@etherealengine/client-core/src/components/Shelves'
import { UserMediaWindows } from '@etherealengine/client-core/src/components/UserMediaWindows'
import { XRLoading } from '@etherealengine/client-core/src/components/XRLoading'
import { LoadingSystemState } from '@etherealengine/client-core/src/systems/state/LoadingState'
import { UserMenu } from '@etherealengine/client-core/src/user/components/UserMenu'
import { iOS } from '@etherealengine/engine/src/common/functions/isMobile'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getCameraMode, XRState } from '@etherealengine/engine/src/xr/XRState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import styles from './index.module.scss'

const LocationIcons = () => {
  const loadingSystemState = useHookstate(getMutableState(LoadingSystemState))
  const engineState = useHookstate(getMutableState(EngineState))
  useHookstate(getMutableState(XRState))
  const cameraMode = getCameraMode()

  if (!engineState.isEngineInitialized.value) return <></>
  return (
    <>
      <UserMenu />
      {/** Container for fading most stuff in and out depending on if the location is loaded or not  */}
      <div style={{ opacity: 1 - loadingSystemState.loadingScreenOpacity.value }}>
        <div className={`${styles.rightSidebar}`}>
          <UserMediaWindows />
          <InstanceChatWrapper />
        </div>
        <Shelves />
        <ARPlacement />
        <XRLoading />
        <MediaIconsBox />
        {cameraMode === 'detached' && <TouchGamepad />}
        {!iOS && <Fullscreen />}
      </div>
    </>
  )
}

LocationIcons.displayName = 'LocationIcons'
LocationIcons.defaultProps = {}

export default LocationIcons
