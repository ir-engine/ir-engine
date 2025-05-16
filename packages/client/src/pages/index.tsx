/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'

import config from '@ir-engine/common/src/config'
import { useMutableState } from '@ir-engine/hyperflux'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import ProfileMenu from '@ir-engine/client-core/src/user/menus/ProfileMenu'
import { ViewerMenuState } from '@ir-engine/client-core/src/util/ViewerMenuState'
import useEngineSetting from '@ir-engine/common/src/hooks/useEngineSetting'
import { ClientEngineSettingType } from '@ir-engine/server-core/src/appconfig'
import './index.scss'

const ROOT_REDIRECT = config.client.rootRedirect

export const HomePage = (): any => {
  const { t } = useTranslation()
  const clientSetting = useEngineSetting<ClientEngineSettingType>('client')

  const viewerMenuState = useMutableState(ViewerMenuState)

  useEffect(() => {
    const error = new URL(window.location.href).searchParams.get('error')
    if (error) NotificationService.dispatchNotify(error, { variant: 'error' })
    ModalState.openModal(<ProfileMenu />)
    viewerMenuState.userMenus.profile.set(true)

    return () => {
      viewerMenuState.userMenus.profile.set(false)
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
        <div className="main-background">
          <div className="img-container">
            {clientSetting?.data?.appBackground && (
              <img
                style={{
                  height: 'auto',
                  maxWidth: '100%'
                }}
                src={clientSetting?.data?.appBackground}
                alt=""
                crossOrigin="anonymous"
              />
            )}
          </div>
        </div>
        <nav className="navbar">
          <div className="logo-section">
            {clientSetting?.data?.appTitle && <object className="lander-logo" data={clientSetting?.data?.appTitle} />}
            <div className="logo-bottom">
              {clientSetting?.data?.appSubtitle && (
                <span className="white-txt">{clientSetting?.data?.appSubtitle}</span>
              )}
            </div>
          </div>
        </nav>
        <div className="main-section">
          <div className="desc">
            {clientSetting?.data?.appDescription && (
              <Trans t={t} i18nKey={clientSetting?.data?.appDescription}>
                <span>{clientSetting?.data?.appDescription}</span>
              </Trans>
            )}
            {Boolean(clientSetting?.data?.homepageLinkButtonEnabled) &&
              clientSetting?.data?.homepageLinkButtonRedirect && (
                <button
                  className="gradientButton"
                  autoFocus
                  onClick={() => (window.location.href = clientSetting?.data?.homepageLinkButtonRedirect || '')}
                >
                  {clientSetting?.data?.homepageLinkButtonText}
                </button>
              )}
          </div>
          <div style={{ flexGrow: 1 }}>
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
          </div>
        </div>
        <div className="link-container">
          <div className="link-block">
            {clientSetting?.data &&
              clientSetting?.data?.appSocialLinks?.length > 0 &&
              clientSetting?.data?.appSocialLinks.map((social, index) => (
                <a key={index} target="_blank" className="icon" href={social.link}>
                  <img
                    style={{
                      height: 'auto',
                      maxWidth: '100%'
                    }}
                    src={social.icon}
                    alt=""
                  />
                </a>
              ))}
          </div>
          <div className="logo-bottom">
            {clientSetting?.data?.appSubtitle && <span className="white-txt">{clientSetting?.data?.appSubtitle}</span>}
          </div>
        </div>
      </div>
    )
}

export default HomePage
