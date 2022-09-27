import React, { Suspense } from 'react'

import UserMenu from '@xrengine/client-core/src/user/components/UserMenu'
import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { isTouchAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'
import { isHMD, isMobileOrHMD } from '@xrengine/engine/src/common/functions/isMobile'
import { getState, useHookstate } from '@xrengine/hyperflux'

import { FullscreenExit, ZoomOutMap } from '@mui/icons-material'

import { AppState } from '../../common/services/AppService'
import { LoadingSystemState } from '../../systems/state/LoadingState'
import MediaIconsBox from '../MediaIconsBox'
import { Shelves } from '../Shelves'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import { useFullscreen } from '../useFullscreen'
import styles from './index.module.scss'

const TouchGamepad = React.lazy(() => import('@xrengine/client-core/src/common/components/TouchGamepad'))

interface Props {
  children?: JSX.Element | JSX.Element[]
  hideFullscreen?: boolean
}

const Layout = ({ children, hideFullscreen }: Props): any => {
  const [fullScreenActive, setFullScreenActive] = useFullscreen()
  const loadingSystemState = useHookstate(getState(LoadingSystemState))
  const appState = useHookstate(getState(AppState))
  const { bottomShelfStyle, topShelfStyle } = useShelfStyles()

  // info about current mode to conditional render menus
  // TODO: Uncomment alerts when we can fix issues
  return (
    <div style={{ pointerEvents: 'auto' }}>
      {children}

      <UserMenu />

      {/** Container for fading most stuff in and out depending on if the location is loaded or not  */}
      <div style={{ opacity: 1 - loadingSystemState.loadingScreenOpacity.value }}>
        <Shelves />
        <MediaIconsBox animate={topShelfStyle} />
        {isTouchAvailable && !isHMD && appState.showTouchPad.value && (
          <Suspense fallback={<></>}>
            {' '}
            <TouchGamepad layout="default" />{' '}
          </Suspense>
        )}

        {!isMobileOrHMD && (
          <>
            {hideFullscreen ? null : fullScreenActive ? (
              <button
                type="button"
                className={`${styles.btn} ${styles.fullScreen} ${bottomShelfStyle} `}
                onClick={() => setFullScreenActive(false)}
                onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              >
                <FullscreenExit />
              </button>
            ) : (
              <button
                type="button"
                className={`${styles.btn} ${styles.fullScreen} ${bottomShelfStyle} `}
                onClick={() => setFullScreenActive(true)}
                onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
                onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              >
                <ZoomOutMap />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Layout
