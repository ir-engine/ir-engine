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

import { t } from 'i18next'
import React, { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import ErrorBoundary from '@etherealengine/client-core/src/common/components/ErrorBoundary'
import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'

// @ts-ignore

;(globalThis as any).process = { env: { ...(import.meta as any).env, APP_ENV: (import.meta as any).env.MODE } }

const Engine = lazy(() => import('./engine'))

const AppPage = lazy(() => import('./pages/_app'))
const AdminPage = lazy(() => import('./pages/admin'))
const CapturePage = lazy(() => import('./pages/_app_tw'))
const ChatPage = lazy(() => import('./pages/_app_chat'))

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route
            key={'default'}
            path={'/*'}
            element={
              <Suspense fallback={<LoadingCircle message={t('common:loader.starting')} />}>
                <Engine>
                  <AppPage />
                </Engine>
              </Suspense>
            }
          />
          <Route
            key={'admin'}
            path={'/admin/*'}
            element={
              <Suspense fallback={<LoadingCircle message={t('common:loader.starting')} />}>
                <Engine>
                  <AdminPage />
                </Engine>
              </Suspense>
            }
          />
          <Route
            key={'capture'}
            path={'/capture/*'}
            element={
              <Suspense fallback={<LoadingCircle message={t('common:loader.starting')} />}>
                <CapturePage />
              </Suspense>
            }
          />
          <Route
            key={'chat'}
            path={'/chat/*'}
            element={
              <Suspense fallback={<LoadingCircle message={t('common:loader.starting')} />}>
                <ChatPage />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(<App />)
