import React, { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { AdminClientSettingsState } from '@etherealengine/client-core/src/admin/services/Setting/ClientSettingService'
import styles from '@etherealengine/client-core/src/admin/styles/admin.module.scss'
import MetaTags from '@etherealengine/client-core/src/common/components/MetaTags'
import { NotificationService } from '@etherealengine/client-core/src/common/services/NotificationService'
import { UserMenu } from '@etherealengine/client-core/src/user/components/UserMenu'
import ProfileMenu from '@etherealengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import SettingMenu from '@etherealengine/client-core/src/user/components/UserMenu/menus/SettingMenu'
import {
  PopupMenuServiceReceptor,
  PopupMenuState
} from '@etherealengine/client-core/src/user/components/UserMenu/PopupMenuService'
import { AvatarServiceReceptor } from '@etherealengine/client-core/src/user/services/AvatarService'
import { UserMenus } from '@etherealengine/client-core/src/user/UserUISystem'
import config from '@etherealengine/common/src/config'
import { addActionReceptor, getMutableState, removeActionReceptor, useHookstate } from '@etherealengine/hyperflux'

import { Box, Button } from '@mui/material'

const ROOT_REDIRECT = config.client.rootRedirect

export const HomePage = (): any => {
  const { t } = useTranslation()
  const clientSettingState = useHookstate(getMutableState(AdminClientSettingsState))
  const [clientSetting] = clientSettingState?.client?.value || []
  const openMenu = useHookstate(getMutableState(PopupMenuState).openMenu)

  useEffect(() => {
    const error = new URL(window.location.href).searchParams.get('error')
    if (error) NotificationService.dispatchNotify(error, { variant: 'error' })

    openMenu.set(UserMenus.Profile)

    addActionReceptor(AvatarServiceReceptor)
    addActionReceptor(PopupMenuServiceReceptor)
    return () => {
      removeActionReceptor(AvatarServiceReceptor)
      removeActionReceptor(PopupMenuServiceReceptor)
    }
  }, [])

  if (ROOT_REDIRECT && ROOT_REDIRECT.length > 0 && ROOT_REDIRECT !== 'false') {
    const redirectParsed = new URL(ROOT_REDIRECT)
    if (redirectParsed.protocol == null) return <Navigate to={ROOT_REDIRECT} />
    else window.location.href = ROOT_REDIRECT
  } else
    return (
      <div className="lander">
        <style>
          {`
            [class*=lander] {
                pointer-events: auto;
            }
          `}
        </style>
        <MetaTags>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;800&display=swap"
            rel="stylesheet"
          />
        </MetaTags>
        <div className="main-background">
          <div className="img-container">
            {clientSetting?.appBackground && <img src={clientSetting.appBackground} alt="" crossOrigin="anonymous" />}
          </div>
        </div>
        <nav className="navbar">
          <div className="logo-section">
            {clientSetting?.appTitle && <object className="lander-logo" data={clientSetting.appTitle} />}
            <div className="logo-bottom">
              {clientSetting?.appSubtitle && <span className="white-txt">{clientSetting.appSubtitle}</span>}
            </div>
          </div>
        </nav>
        <div className="main-section">
          <div className="desc">
            {clientSetting?.appDescription && (
              <Trans t={t} i18nKey={clientSetting.appDescription}>
                <span>{clientSetting.appDescription}</span>
              </Trans>
            )}
            {clientSetting.homepageLinkButtonEnabled && (
              <Button
                className={styles.gradientButton + ' ' + styles.forceVaporwave}
                autoFocus
                onClick={() => (window.location.href = clientSetting.homepageLinkButtonRedirect)}
              >
                {clientSetting.homepageLinkButtonText}
              </Button>
            )}
          </div>
          <Box sx={{ flex: 1 }}>
            <style>
              {`
                [class*=menu] {
                    position: unset;
                    bottom: 0px;
                    top: 0px;
                    left: 0px;
                    width: 100%;
                    transform: none;
                    pointer-events: auto;
                }
              `}
            </style>
            {openMenu.value === UserMenus.Profile && <ProfileMenu isPopover />}
          </Box>
        </div>
        <div className="link-container">
          <div className="link-block">
            {clientSetting?.appSocialLinks?.length > 0 &&
              clientSetting.appSocialLinks.map((social, index) => (
                <a key={index} target="_blank" className="icon" href={social.link}>
                  <img src={social.icon} alt="" />
                </a>
              ))}
          </div>
          <div className="logo-bottom">
            {clientSetting?.appSubtitle && <span className="white-txt">{clientSetting.appSubtitle}</span>}
          </div>
        </div>
      </div>
    )
}

export default HomePage
