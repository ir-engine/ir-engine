import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Trans, useTranslation } from 'react-i18next'
import { Redirect } from 'react-router-dom'

import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'

const ROOT_REDIRECT: any = globalThis.process.env['VITE_ROOT_REDIRECT']

export const HomePage = (): any => {
  const { t } = useTranslation()

  useEffect(() => {
    AuthService.doLoginAuto(true)
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
            <img src="static/main-background.png" alt="" />
          </div>
        </div>
        <nav className="navbar">
          <div className="logo-section">
            <object className="lander-logo" data="static/overlay_mark.svg" />
            <div className="logo-bottom">
              <span className="gray-txt">{t('index.by')}</span>
              <span className="gradiant-txt">{t('index.xr')}</span>
              <span className="white-txt">{t('index.foundation')}</span>
            </div>
          </div>
        </nav>

        <div className="main-section">
          <div className="desc">
            <Trans t={t} i18nKey="index.description">
              <span>Realtime 3D social application for everyone to enjoy.</span>
            </Trans>
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
                    transform: none;
                    margin: 40px 0px;
                    pointer-events: auto;
                }
              `}
            </style>
            <ProfileMenu />
          </div>
        </div>
        <div className="link-container">
          <div className="link-block">
            <a target="_blank" className="icon" href="https://discord.gg/xrf">
              <img src="static/discord.svg" />
            </a>
            <a target="_blank" className="icon" href="https://github.com/XRFoundation">
              <img src="static/github.svg" />
            </a>
          </div>
          <div className="logo-bottom">
            <span className="gray-txt">{t('index.by')}</span>
            <span className="gradiant-txt">{t('index.xr')}</span>
            <span className="white-txt">{t('index.foundation')}</span>
          </div>
        </div>
      </div>
    )
}

export default HomePage
