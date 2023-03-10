import React, { Fragment, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { useClientSettingState } from '@etherealengine/client-core/src/admin/services/Setting/ClientSettingService'
import styles from '@etherealengine/client-core/src/admin/styles/admin.module.scss'
import MetaTags from '@etherealengine/client-core/src/common/components/MetaTags'
import { NotificationService } from '@etherealengine/client-core/src/common/services/NotificationService'
import ProfileMenu from '@etherealengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import SettingMenu from '@etherealengine/client-core/src/user/components/UserMenu/menus/SettingMenu'
import { Views } from '@etherealengine/client-core/src/user/components/UserMenu/util'
import config from '@etherealengine/common/src/config'
import Mediapipe from '@etherealengine/ui/src/Mediapipe'

import { Box, Button } from '@mui/material'

const ROOT_REDIRECT = config.client.rootRedirect

export const HomePage = (): any => {
  const { t } = useTranslation()
  const clientSettingState = useClientSettingState()
  // @ts-ignore
  const [clientSetting] = clientSettingState?.client?.value || []

  useEffect(() => {
    const error = new URL(window.location.href).searchParams.get('error')
    if (error) NotificationService.dispatchNotify(error, { variant: 'error' })
  }, [])

  if (ROOT_REDIRECT && ROOT_REDIRECT.length > 0 && ROOT_REDIRECT !== 'false') {
    const redirectParsed = new URL(ROOT_REDIRECT)
    if (redirectParsed.protocol == null) return <Navigate to={ROOT_REDIRECT} />
    else window.location.href = ROOT_REDIRECT
  } else
    return (
      <div>
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
        <div>{<Mediapipe />}</div>
      </div>
    )
}

export default HomePage
