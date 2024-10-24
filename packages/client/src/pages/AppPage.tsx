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

// import * as chapiWalletPolyfill from 'credential-handler-polyfill'

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { initGA, logPageView } from '@ir-engine/client-core/src/common/analytics'
import { NotificationSnackbar } from '@ir-engine/client-core/src/common/services/NotificationService'
import { useSearchParamState } from '@ir-engine/client-core/src/common/services/RouterService'
import { useThemeProvider } from '@ir-engine/client-core/src/common/services/ThemeService'
import { LoadWebappInjection } from '@ir-engine/client-core/src/components/LoadWebappInjection'
import { useAuthenticated } from '@ir-engine/client-core/src/user/services/AuthService'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

import './mui.styles.scss' /** @todo Remove when MUI is removed */
import './styles.scss'

const AppPage = (props: { children: React.ReactNode; fallback?: JSX.Element }) => {
  const { t } = useTranslation()
  const isLoggedIn = useAuthenticated()

  useEffect(() => {
    initGA()
    logPageView()
  }, [])

  useThemeProvider()

  useSearchParamState()

  if (!isLoggedIn) {
    return (
      props.fallback ?? <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingApp')} />
    )
  }

  return (
    <>
      <NotificationSnackbar />
      <LoadWebappInjection fallback={props.fallback}>{props.children}</LoadWebappInjection>
    </>
  )
}

export default AppPage
