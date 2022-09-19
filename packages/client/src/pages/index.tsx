import React, { Fragment, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Trans, useTranslation } from 'react-i18next'
import { Redirect } from 'react-router-dom'

import { useClientSettingState } from '@xrengine/client-core/src/admin/services/Setting/ClientSettingService'
import styles from '@xrengine/client-core/src/admin/styles/admin.module.scss'
import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import SettingMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/SettingMenu'
import { Views } from '@xrengine/client-core/src/user/components/UserMenu/util'

import { Button } from '@mui/material'

const ROOT_REDIRECT: any = globalThis.process.env['VITE_ROOT_REDIRECT']

export const HomePage = (): any => {
  const { t } = useTranslation()
  const clientSettingState = useClientSettingState()
  const [clientSetting] = clientSettingState?.client?.value || []
  const [selectedMenu, setSelectedMenu] = useState(Views.Profile)

  useEffect(() => {
    const error = new URL(window.location.href).searchParams.get('error')
    if (error) NotificationService.dispatchNotify(error, { variant: 'error' })
  }, [])

  if (ROOT_REDIRECT && ROOT_REDIRECT.length > 0 && ROOT_REDIRECT !== 'false') {
    const redirectParsed = new URL(ROOT_REDIRECT)
    if (redirectParsed.protocol == null) return <Redirect to={ROOT_REDIRECT} />
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
        <Helmet>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;800&display=swap"
            rel="stylesheet"
          />
        </Helmet>
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
            <Button
              className={styles.gradientButton + ' ' + styles.forceVaporwave}
              autoFocus
              onClick={() => (window.location.href = 'https://etherealengine.com/explore')}
            >
              {t('common:exploreRedirect')}
            </Button>
          </div>
          <div className="form-container">
            <style>
              {`
                [class*=menuPanel] {
                    position: unset;
                    bottom: 0px;
                    top: 0px;
                    left: 0px;
                    width: 100%;
                    min-width: 420px;
                    transform: none;
                    pointer-events: auto;
                }
              `}
            </style>
            {selectedMenu === Views.Profile && (
              <ProfileMenu changeActiveMenu={(type) => setSelectedMenu(type ? type : Views.Profile)} />
            )}
            {selectedMenu === Views.Settings && (
              <SettingMenu changeActiveMenu={(type) => setSelectedMenu(type ? type : Views.Profile)} />
            )}
          </div>
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
