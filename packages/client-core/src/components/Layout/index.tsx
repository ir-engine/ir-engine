import React, { Suspense, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'

import {
  ClientSettingService,
  useClientSettingState
} from '@xrengine/client-core/src/admin/services/Setting/ClientSettingService'
import {
  AdminCoilSettingService,
  useCoilSettingState
} from '@xrengine/client-core/src/admin/services/Setting/CoilSettingService'
import UIDialog from '@xrengine/client-core/src/common/components/Dialog'
import UserMenu from '@xrengine/client-core/src/user/components/UserMenu'
import { respawnAvatar } from '@xrengine/engine/src/avatar/functions/respawnAvatar'
import { isTouchAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'

import { FullscreenExit, Refresh, ZoomOutMap } from '@mui/icons-material'
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown'
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp'

import { useLoadingSystemState } from '../../systems/state/LoadingState'
import Debug from '../Debug'
import InstanceChat from '../InstanceChat'
import MediaIconsBox from '../MediaIconsBox'
import PartyVideoWindows from '../PartyVideoWindows'
import { useFullscreen } from '../useFullscreen'
import styles from './index.module.scss'

const TouchGamepad = React.lazy(() => import('@xrengine/client-core/src/common/components/TouchGamepad'))

interface Props {
  useLoadingScreenOpacity?: boolean
  pageTitle: string
  children?: JSX.Element | JSX.Element[]
  hideVideo?: boolean
  hideFullscreen?: boolean
}

const Layout = ({ useLoadingScreenOpacity, pageTitle, children, hideVideo, hideFullscreen }: Props): any => {
  const clientSettingState = useClientSettingState()
  const coilSettingState = useCoilSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []
  const [coilSetting] = coilSettingState?.coil?.value || []
  const [fullScreenActive, setFullScreenActive] = useFullscreen()
  const [ctitle, setTitle] = useState<string>(clientSetting?.title || '')
  const [favicon16, setFavicon16] = useState(clientSetting?.favicon16px)
  const [favicon32, setFavicon32] = useState(clientSetting?.favicon32px)
  const [paymentPointer, setPaymentPointer] = useState(coilSetting?.paymentPointer)
  const [description, setDescription] = useState(clientSetting?.siteDescription)
  const [showMediaIcons, setShowMediaIcons] = useState(true)
  const [showBottomIcons, setShowBottomIcons] = useState(true)
  const loadingSystemState = useLoadingSystemState()
  const [showTouchPad, setShowTouchPad] = useState(true)

  const engineState = useEngineState()

  useEffect(() => {
    !coilSetting && AdminCoilSettingService.fetchCoil()
    const topButtonsState = localStorage.getItem('isTopButtonsShown')
    const bottomButtonsState = localStorage.getItem('isBottomButtonsShown')
    if (!topButtonsState) {
      localStorage.setItem('isTopButtonsShown', 'true')
    } else {
      setShowMediaIcons(JSON.parse(topButtonsState))
    }
    if (!bottomButtonsState) {
      localStorage.setItem('isBottomButtonsShown', 'true')
    } else {
      setShowBottomIcons(JSON.parse(bottomButtonsState))
    }
  }, [])

  useEffect(() => {
    if (clientSetting) {
      setTitle(clientSetting?.title)
      setFavicon16(clientSetting?.favicon16px)
      setFavicon32(clientSetting?.favicon32px)
      setDescription(clientSetting?.siteDescription)
    }
    if (coilSetting) {
      setPaymentPointer(coilSetting?.paymentPointer)
    }
  }, [clientSettingState?.updateNeeded?.value, coilSettingState?.updateNeeded?.value])

  const iOS = (): boolean => {
    return (
      ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
      // iPad on iOS 13 detection
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
    )
  }

  const respawnCallback = (): void => {
    respawnAvatar(useWorld().localClientEntity)
  }

  const hideOtherMenus = (): void => {
    setShowMediaIcons(false)
    setShowBottomIcons(false)
    setShowTouchPad(false)
  }

  const handleShowMediaIcons = () => {
    setShowMediaIcons(!showMediaIcons)
    const topButtonsState = localStorage.getItem('isTopButtonsShown') || ''
    localStorage.setItem('isTopButtonsShown', JSON.stringify(!JSON.parse(topButtonsState)))
  }

  const handleShowBottomIcons = () => {
    setShowBottomIcons(!showBottomIcons)
    const bottomButtonsState = localStorage.getItem('isBottomButtonsShown') || ''
    localStorage.setItem('isBottomButtonsShown', JSON.stringify(!JSON.parse(bottomButtonsState)))
  }

  const useOpacity = typeof useLoadingScreenOpacity !== 'undefined' && useLoadingScreenOpacity === true
  const layoutOpacity = useOpacity ? loadingSystemState.opacity.value : 1
  const MediaIconHider = showMediaIcons ? KeyboardDoubleArrowUpIcon : KeyboardDoubleArrowDownIcon
  const BottomIconHider = showBottomIcons ? KeyboardDoubleArrowDownIcon : KeyboardDoubleArrowUpIcon
  // info about current mode to conditional render menus
  // TODO: Uncomment alerts when we can fix issues
  return (
    <div style={{ pointerEvents: 'auto' }}>
      <section>
        <Helmet>
          <title>
            {ctitle} | {pageTitle}
          </title>
          {description && <meta name="description" content={description}></meta>}
          {paymentPointer && <meta name="monetization" content={paymentPointer} />}
          {favicon16 && <link rel="icon" type="image/png" sizes="16x16" href={favicon16} />}
          {favicon32 && <link rel="icon" type="image/png" sizes="32x32" href={favicon32} />}
        </Helmet>

        {children}
        {
          <UserMenu
            animate={showBottomIcons ? styles.animateBottom : styles.fadeOutBottom}
            fadeOutBottom={styles.fadeOutBottom}
          />
        }
        <Debug />

        {/** Container for fading most stuff in and out depending on if the location is loaded or not  */}
        <div style={{ opacity: layoutOpacity }}>
          <button
            type="button"
            className={`${showMediaIcons ? styles.btn : styles.smBtn} ${
              showMediaIcons ? styles.rotate : styles.rotateBack
            } ${styles.showIconMedia} `}
            onClick={handleShowMediaIcons}
          >
            <MediaIconHider />
          </button>
          <MediaIconsBox animate={showMediaIcons ? styles.animateTop : styles.fadeOutTop} />
          <header className={showMediaIcons ? styles.animateTop : styles.fadeOutTop}>
            {!hideVideo && (
              <>
                <section className={styles.locationUserMenu}>
                  <PartyVideoWindows />
                </section>
              </>
            )}
          </header>
          <button
            type="button"
            className={`${showBottomIcons ? styles.btn : styles.smBtn} ${
              showBottomIcons ? styles.rotate : styles.rotateBack
            } ${styles.showIcon} `}
            onClick={handleShowBottomIcons}
          >
            <BottomIconHider />
          </button>
          <UIDialog />
          {isTouchAvailable && showTouchPad && (
            <Suspense fallback={<></>}>
              {' '}
              <TouchGamepad layout="default" />{' '}
            </Suspense>
          )}

          {!iOS() && (
            <>
              {hideFullscreen ? null : fullScreenActive ? (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.fullScreen} ${
                    showBottomIcons ? styles.animateBottom : styles.fadeOutBottom
                  } `}
                  onClick={() => setFullScreenActive(false)}
                >
                  <FullscreenExit />
                </button>
              ) : (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.fullScreen} ${
                    showBottomIcons ? styles.animateBottom : styles.fadeOutBottom
                  } `}
                  onClick={() => setFullScreenActive(true)}
                >
                  <ZoomOutMap />
                </button>
              )}
            </>
          )}
          <button
            type="button"
            className={`${styles.btn} ${styles.respawn} ${
              showBottomIcons ? styles.animateBottom : styles.fadeOutBottom
            } ${!iOS() ? '' : styles.refreshBtn}`}
            id="respawn"
            onClick={respawnCallback}
          >
            <Refresh />
          </button>
          {!engineState.xrSessionStarted.value && (
            <InstanceChat
              animate={styles.animateBottom}
              hideOtherMenus={hideOtherMenus}
              setShowTouchPad={setShowTouchPad}
            />
          )}
        </div>
      </section>
    </div>
  )
}

export default Layout
