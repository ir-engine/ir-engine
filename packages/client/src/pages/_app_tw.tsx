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
import React, { useCallback, useEffect, useRef, useState } from 'react'

import {
  AdminClientSettingsState,
  ClientSettingService
} from '@etherealengine/client-core/src/admin/services/Setting/ClientSettingService'

import { API } from '@etherealengine/client-core/src/API'
import { initGA, logPageView } from '@etherealengine/client-core/src/common/analytics'
import { defaultAction } from '@etherealengine/client-core/src/common/components/NotificationActions'
import { NotificationState } from '@etherealengine/client-core/src/common/services/NotificationService'
import { ProjectService, ProjectState } from '@etherealengine/client-core/src/common/services/ProjectService'
import Debug from '@etherealengine/client-core/src/components/Debug'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { loadWebappInjection } from '@etherealengine/projects/loadWebappInjection'

import EngineTW from '../engine_tw'
import PublicRouter from '../route/public_tw'
import { ThemeContextProvider } from '../themes/themeContext'

import { projectsPath } from '@etherealengine/engine/src/schemas/projects/projects.schema'
import 'daisyui/dist/full.css'
import 'tailwindcss/tailwind.css'
import '../themes/base.css'
import '../themes/components.css'
import '../themes/utilities.css'

const AppPage = () => {
  const authState = useHookstate(getMutableState(AuthState))
  const selfUser = authState.user
  const clientSettingState = useHookstate(getMutableState(AdminClientSettingsState))
  const [projectComponents, setProjectComponents] = useState<Array<any>>([])
  const [fetchedProjectComponents, setFetchedProjectComponents] = useState(false)
  const projectState = useHookstate(getMutableState(ProjectState))

  const initApp = useCallback(() => {
    initGA()
    logPageView()
  }, [])

  useEffect(initApp, [])

  // useEffect(() => {
  //   chapiWalletPolyfill
  //     .loadOnce()
  //     .then(() => console.log('CHAPI wallet polyfill loaded.'))
  //     .catch((e) => console.error('Error loading polyfill:', e))
  // }, [])

  useEffect(() => {
    if (selfUser?.id.value && projectState.updateNeeded.value) {
      ProjectService.fetchProjects()
      if (!fetchedProjectComponents) {
        setFetchedProjectComponents(true)
        API.instance.client
          .service(projectsPath)
          .find()
          .then((projects) => {
            loadWebappInjection(projects).then((result) => {
              setProjectComponents(result)
            })
          })
      }
    }
  }, [selfUser, projectState.updateNeeded.value])

  useEffect(() => {
    Engine.instance.userID = selfUser.id.value
  }, [selfUser.id])

  useEffect(() => {
    if (clientSettingState?.updateNeeded?.value) ClientSettingService.fetchClientSettings()
  }, [clientSettingState?.updateNeeded?.value])

  return (
    <>
      <PublicRouter />
      {projectComponents.map((Component, i) => (
        <Component key={i} />
      ))}
    </>
  )
}

const TailwindPage = () => {
  const notistackRef = useRef<SnackbarProvider>()
  const notificationstate = useHookstate(getMutableState(NotificationState))

  useEffect(() => {
    notificationstate.snackbar.set(notistackRef.current)
  }, [notistackRef.current])

  return (
    <EngineTW>
      <ThemeContextProvider>
        <SnackbarProvider
          ref={notistackRef as any}
          maxSnack={7}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          action={defaultAction}
        >
          <AppPage />
          <Debug />
        </SnackbarProvider>
      </ThemeContextProvider>
    </EngineTW>
  )
}

export default TailwindPage
