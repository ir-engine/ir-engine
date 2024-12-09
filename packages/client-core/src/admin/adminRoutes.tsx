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

import React, { lazy, useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'

import { ThemeState } from '@ir-engine/client-core/src/common/services/ThemeService'
import { getMutableState, getState, NO_PROXY, useHookstate, useMutableState } from '@ir-engine/hyperflux'

import { AuthService, AuthState } from '../user/services/AuthService'
import { AllowedAdminRoutesState } from './AllowedAdminRoutesState'

import '@ir-engine/engine/src/EngineModule'

import { useTranslation } from 'react-i18next'
import { HiMiniMoon, HiMiniSun } from 'react-icons/hi2'

import { useFind } from '@ir-engine/common'
import { identityProviderPath, scopePath } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs'
import { Button, Tooltip } from '@ir-engine/ui'
import PopupMenu from '@ir-engine/ui/src/primitives/tailwind/PopupMenu'
import { RouterState } from '../common/services/RouterService'
import { DefaultAdminRoutes } from './DefaultAdminRoutes'

const $allowed = lazy(() => import('@ir-engine/client-core/src/admin/allowedRoutes'))

const AdminTopBar = () => {
  const { t } = useTranslation()
  const theme = useHookstate(getMutableState(ThemeState)).theme
  const identityProvidersQuery = useFind(identityProviderPath)
  const selfUser = getState(AuthState).user
  const tooltip = `${selfUser.name} (${identityProvidersQuery.data
    .map((item) => `${item.type}: ${item.accountIdentifier}`)
    .join(', ')}) ${selfUser.id}`

  const toggleTheme = () => {
    const currentTheme = getState(ThemeState).theme
    ThemeState.setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex h-16 w-full items-center justify-between bg-theme-surface-main px-8 py-4">
      <img src="static/ir.svg" alt="iR Engine Logo" className={`h-7 w-7${theme.value === 'light' ? ' invert' : ''}`} />
      <div className="flex gap-4">
        <Button onClick={toggleTheme} className="pointer-events-auto bg-transparent p-0">
          {theme.value === 'light' ? (
            <HiMiniMoon className="text-theme-primary" size="1.5rem" />
          ) : (
            <HiMiniSun className="text-theme-primary" size="1.5rem" />
          )}
        </Button>
        <Tooltip content={tooltip}>
          <Button className="pointer-events-auto" size="sm" onClick={() => AuthService.logoutUser()}>
            {t('admin:components.common.logOut')}
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}

const AdminSideBar = () => {
  const allowedRoutes = useHookstate(getMutableState(AllowedAdminRoutesState)).get(NO_PROXY)

  const location = useLocation()
  const { pathname: fullPathName } = location
  const { t } = useTranslation()

  const relativePath = fullPathName.split('/').slice(2).join('/')

  return (
    <aside className="mx-8 h-fit overflow-y-auto overflow-x-hidden rounded-2xl bg-theme-surface-main px-2 py-4">
      <ul className="space-y-2">
        {Object.entries(allowedRoutes)
          .filter(([_, sidebarItem]) => sidebarItem.access)
          .map(([path, sidebarItem], index) => {
            return (
              <li key={index}>
                <Link to={path}>
                  <Button
                    className={`hover:bg-theme-highlight] flex w-72 items-center justify-start rounded-xl px-2 py-3 font-medium text-theme-secondary ${
                      relativePath === path
                        ? 'bg-theme-highlight font-semibold text-theme-primary '
                        : 'bg-theme-surface-main'
                    }`}
                  >
                    {sidebarItem.icon}
                    {t(sidebarItem.name)}
                  </Button>
                </Link>
              </li>
            )
          })}
      </ul>
    </aside>
  )
}

const AdminRoutes = () => {
  const location = useLocation()
  const scopeQuery = useFind(scopePath, { query: { userId: Engine.instance.store.userID, paginate: false } })

  const allowedRoutes = useMutableState(AllowedAdminRoutesState)

  useEffect(() => {
    allowedRoutes.set(DefaultAdminRoutes)
  }, [])

  useEffect(() => {
    for (const [route, state] of Object.entries(allowedRoutes)) {
      const routeScope = state.scope.value
      const hasScope =
        routeScope === '' ||
        scopeQuery.data.find((scope) => {
          const [scopeKey, type] = scope.type.split(':')
          return Array.isArray(routeScope) ? routeScope.includes(scopeKey) : scopeKey === routeScope
        })
      state.access.set(!!hasScope)
    }
  }, [scopeQuery.data])

  useEffect(() => {
    if (scopeQuery.status !== 'success') return

    if (!scopeQuery.data.find((scope) => scope.type === 'admin:admin')) {
      RouterState.navigate('/', { redirectUrl: location.pathname })
    }
  }, [scopeQuery.data])

  if (!scopeQuery.data.find((scope) => scope.type === 'admin:admin')) {
    return <></>
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminTopBar />
      <main className="pointer-events-auto flex h-[calc(100vh_-_88px_-_4rem)] gap-1.5 overflow-y-auto">
        <AdminSideBar />
        <div className="h-full w-full overflow-x-auto overflow-y-auto px-3">
          <Routes>
            <Route path="/*" element={<$allowed />} />
          </Routes>
        </div>
        <PopupMenu />
      </main>
    </div>
  )
}

export default AdminRoutes
