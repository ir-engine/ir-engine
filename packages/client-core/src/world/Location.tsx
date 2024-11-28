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
import { useParams } from 'react-router-dom'

import { LocationIcons } from '@ir-engine/client-core/src/components/LocationIcons'
import { useLoadLocation, useLoadScene } from '@ir-engine/client-core/src/components/World/LoadLocationScene'
import { AuthService } from '@ir-engine/client-core/src/user/services/AuthService'
import { ThemeContextProvider } from '@ir-engine/client/src/pages/themeContext'
import { useMutableState } from '@ir-engine/hyperflux'

import '@ir-engine/client-core/src/util/GlobalStyle.css'

import './LocationModule'

import multiLogger from '@ir-engine/common/src/logger'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import { StyledEngineProvider } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { NotificationService } from '../common/services/NotificationService'
import { useNetwork } from '../components/World/EngineHooks'
import { LocationService } from '../social/services/LocationService'
import { LoadingUISystemState } from '../systems/LoadingUISystem'
import { clientContextParams } from '../util/ClientContextState'

const logger = multiLogger.child({ component: 'system:location', modifier: clientContextParams })

type Props = {
  online?: boolean
}

const LocationPage = ({ online }: Props) => {
  const { t } = useTranslation()
  const params = useParams()
  const ready = useMutableState(LoadingUISystemState).ready

  useNetwork({ online })

  if (params.locationName) {
    useLoadLocation({ locationName: params.locationName })
  } else {
    useLoadScene({ projectName: params.projectName!, sceneName: params.sceneName! })
  }

  AuthService.useAPIListeners()
  LocationService.useLocationBanListeners()

  useEffect(() => {
    if (!ready.value) return
    logger.info({ event_name: 'enter_location' })
    return () => logger.info({ event_name: 'exit_location' })
  }, [ready.value])

  // To show invalid token error
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    if (queryParams.has('error')) {
      NotificationService.dispatchNotify(t('common:error.expiredToken'), {
        variant: 'error'
      })
    }
  }, [location.search])

  return (
    <>
      <ThemeContextProvider>
        <StyledEngineProvider injectFirst>
          {!ready.value && (
            <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingEngine')} />
          )}
          <LocationIcons />
        </StyledEngineProvider>
      </ThemeContextProvider>
    </>
  )
}

export default LocationPage
