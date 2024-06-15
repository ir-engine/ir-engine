/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

// import * as chapiWalletPolyfill from 'credential-handler-polyfill'
import { SnackbarProvider } from 'notistack'
import React, { useEffect, useRef } from 'react'

import { initGA, logPageView } from '@etherealengine/client-core/src/common/analytics'
import {
  NotificationSnackbar,
  NotificationState
} from '@etherealengine/client-core/src/common/services/NotificationService'
import Debug from '@etherealengine/client-core/src/components/Debug'
import InviteToast from '@etherealengine/client-core/src/components/InviteToast'
import { useAuthenticated } from '@etherealengine/client-core/src/user/services/AuthService'

import '@etherealengine/client-core/src/util/GlobalStyle.css'

import { StyledEngineProvider, Theme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { useMutableState } from '@etherealengine/hyperflux'

import { LoadWebappInjection } from '@etherealengine/client-core/src/components/LoadWebappInjection'
import RouterComp from '../route/public'
import { ThemeContextProvider } from './themeContext'

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

/** @deprecated see https://github.com/EtherealEngine/etherealengine/issues/6485 */
const AppPage = ({ route }: { route: string }) => {
  const notistackRef = useRef<SnackbarProvider>()
  const isLoggedIn = useAuthenticated()
  const notificationstate = useMutableState(NotificationState)
  const { t } = useTranslation()

  useEffect(() => {
    initGA()
    logPageView()
  }, [])

  useEffect(() => {
    notificationstate.snackbar.set(notistackRef.current)
  }, [notistackRef.current])

  if (!isLoggedIn) {
    return <LoadingCircle message={t('common:loader.authenticating')} />
  }

  return (
    <>
      <ThemeContextProvider>
        <StyledEngineProvider injectFirst>
          <NotificationSnackbar
            style={{
              fontFamily: 'var(--lato)',
              fontSize: '12px'
            }}
          />
          <div style={{ pointerEvents: 'auto' }}>
            <InviteToast />
            <Debug />
          </div>
          <LoadWebappInjection>
            <RouterComp route={route} />
          </LoadWebappInjection>
        </StyledEngineProvider>
      </ThemeContextProvider>
    </>
  )
}

export default AppPage
