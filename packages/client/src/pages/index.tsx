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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import styles from '@ir-engine/client-core/src/admin/old-styles/admin.module.scss'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'

import { PopupMenuState } from '@ir-engine/client-core/src/user/components/UserMenu/PopupMenuService'
import config from '@ir-engine/common/src/config'
import { getState, none, useMutableState } from '@ir-engine/hyperflux'

import { Box, Button } from '@mui/material'

import ProfileMenu from '@ir-engine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import { UserMenus } from '@ir-engine/client-core/src/user/UserUISystem'

import { useFind } from '@ir-engine/common'
import { clientSettingPath } from '@ir-engine/common/src/schema.type.module'
import './index.scss'

const ROOT_REDIRECT = config.client.rootRedirect

export const HomePage = (): any => {
  const { t } = useTranslation()
  const clientSettingQuery = useFind(clientSettingPath)
  const clientSetting = clientSettingQuery.data[0]
  const popupMenuState = useMutableState(PopupMenuState)
  const popupMenu = getState(PopupMenuState)
  const Panel = popupMenuState.openMenu.value ? popupMenu.menus[popupMenuState.openMenu.value] : null

  useEffect(() => {
    const error = new URL(window.location.href).searchParams.get('error')
    if (error) NotificationService.dispatchNotify(error, { variant: 'error' })
    popupMenuState.openMenu.set(UserMenus.Profile)

    popupMenuState.menus.merge({
      [UserMenus.Profile]: ProfileMenu
    })

    return () => {
      popupMenuState.menus.merge({
        [UserMenus.Profile]: none
      })
      popupMenuState.openMenu.set(null)
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
            {clientSetting?.appBackground && (
              <img
                style={{
                  height: 'auto',
                  maxWidth: '100%'
                }}
                src={clientSetting?.appBackground}
                alt=""
                crossOrigin="anonymous"
              />
            )}
          </div>
        </div>
        <nav className="navbar">
          <div className="logo-section">
            {clientSetting?.appTitle && <object className="lander-logo" data={clientSetting?.appTitle} />}
            <div className="logo-bottom">
              {clientSetting?.appSubtitle && <span className="white-txt">{clientSetting?.appSubtitle}</span>}
            </div>
          </div>
        </nav>
        <div className="main-section">
          <div className="desc">
            {clientSetting?.appDescription && (
              <Trans t={t} i18nKey={clientSetting?.appDescription}>
                <span>{clientSetting?.appDescription}</span>
              </Trans>
            )}
            {Boolean(clientSetting?.homepageLinkButtonEnabled) && (
              <Button
                className={styles.gradientButton + ' ' + styles.forceVaporwave}
                autoFocus
                onClick={() => (window.location.href = clientSetting?.homepageLinkButtonRedirect)}
              >
                {clientSetting?.homepageLinkButtonText}
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
            {Panel && <Panel {...popupMenu.params} isPopover />}
            {popupMenuState.openMenu.value !== UserMenus.Profile && <ProfileMenu isPopover />}
          </Box>
        </div>
        <div className="link-container">
          <div className="link-block">
            {clientSetting?.appSocialLinks?.length > 0 &&
              clientSetting?.appSocialLinks.map((social, index) => (
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
            {clientSetting?.appSubtitle && <span className="white-txt">{clientSetting?.appSubtitle}</span>}
          </div>
        </div>
      </div>
    )
}

export default HomePage
