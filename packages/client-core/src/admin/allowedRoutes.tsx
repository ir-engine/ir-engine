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
import { Route, Routes, useLocation } from 'react-router-dom'

import { LoadingCircle } from '../components/LoadingCircle'

const Avatars = lazy(() => import('./components/Avatars'))
const Benchmarking = lazy(() => import('./components/Benchmarking'))
const BotSetting = lazy(() => import('./components/Bots'))
const Groups = lazy(() => import('./components/Group'))
const Instance = lazy(() => import('./components/Instance'))
const Invites = lazy(() => import('./components/Invite'))
const Locations = lazy(() => import('./components/Location'))
const Party = lazy(() => import('./components/Party'))
const Projects = lazy(() => import('./components/Project'))
const Recordings = lazy(() => import('./components/Recordings'))
const Resources = lazy(() => import('./components/Resources'))
const RoutesComp = lazy(() => import('./components/Routes'))
const Server = lazy(() => import('./components/Server'))
const Setting = lazy(() => import('./components/Setting'))
const Users = lazy(() => import('./components/Users'))

const availableRoutes = [
  { route: '/avatars', key: 'globalAvatars', component: Avatars, props: {} },
  { route: '/benchmarking', key: 'benchmarking', component: Benchmarking, props: {} },
  { route: '/groups', key: 'groups', component: Groups, props: {} },
  { route: '/instance', key: 'instance', component: Instance, props: {} },
  { route: '/invites', key: 'invite', component: Invites, props: {} },
  { route: '/locations', key: 'location', component: Locations, props: {} },
  { route: '/routes', key: 'routes', component: RoutesComp, props: {} },
  { route: '/parties', key: 'party', component: Party, props: {} },
  { route: '/bots', key: 'bot', component: BotSetting, props: {} },
  { route: '/projects', key: 'projects', component: Projects, props: {} },
  { route: '/server', key: 'server', component: Server, props: {} },
  { route: '/settings', key: 'settings', component: Setting, props: {} },
  { route: '/resources', key: 'static_resource', component: Resources, props: {} },
  { route: '/users', key: 'user', component: Users, props: {} },
  { route: '/recordings', key: 'recording', component: Recordings, props: {} }
]

const AllowedRoutes = ({ allowedRoutes }) => {
  const location = useLocation()
  const { pathname } = location

  // Improve loading by only using matched route
  const matchedRoutes = availableRoutes.filter((r) => {
    return r.route.split('/')[1] === pathname.split('/')[2] && allowedRoutes[r.key]
  })

  return (
    <Suspense fallback={<LoadingCircle message={t('common:loader.loadingAllowed')} />}>
      <Routes>
        {matchedRoutes.map((route, i) => {
          const { route: r, component, props: p } = route
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const Element = component as any
          return (
            <Route
              key={`custom-route-${i}`}
              path={r.split('/')[1] === '' ? `${r}*` : `${r}/*`}
              element={<Element />}
              {...p}
            />
          )
        })}
      </Routes>
    </Suspense>
  )
}

export default AllowedRoutes
