import React from 'react'

import { TouchGamepad } from '@etherealengine/client-core/src/common/components/TouchGamepad'
import { UserMenu } from '@etherealengine/client-core/src/user/components/UserMenu'
import { iOS } from '@etherealengine/engine/src/common/functions/isMobile'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getCameraMode, XRState } from '@etherealengine/engine/src/xr/XRState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { LoadingSystemState } from '../../systems/state/LoadingState'
import { ARPlacement } from '../ARPlacement'
import { Fullscreen } from '../Fullscreen'
import { InstanceChatWrapper } from '../InstanceChat'
import { MediaIconsBox } from '../MediaIconsBox'
import { Shelves } from '../Shelves'
import { UserMediaWindows } from '../UserMediaWindows'
import { XRLoading } from '../XRLoading'
import styles from './index.module.scss'

export const LocationIcons = () => {
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
