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

import { clientSettingPath } from '@etherealengine/engine/src/schemas/setting/client-setting.schema'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import React, { lazy } from 'react'
import { AdminRouteStateType } from './AllowedAdminRoutesState'

const Avatars = lazy(() => import('./components/Avatars'))
const Benchmarking = lazy(() => import('./components/Benchmarking'))
const BotSetting = lazy(() => import('./components/Bots'))
const Instance = lazy(() => import('./components/Instance'))
const Invites = lazy(() => import('./components/Invite'))
const Locations = lazy(() => import('./components/Location'))
const Channels = lazy(() => import('./components/Channels'))
const Projects = lazy(() => import('./components/Project'))
const Recordings = lazy(() => import('./components/Recordings'))
const Resources = lazy(() => import('./components/Resources'))
const RoutesComp = lazy(() => import('./components/Routes'))
const Server = lazy(() => import('./components/Server'))
const Setting = lazy(() => import('./components/Setting'))
const Users = lazy(() => import('./components/Users'))

export const DefaultAdminRoutes: Record<string, AdminRouteStateType> = {
  analytics: {
    name: 'user:dashboard.dashboard',
    scope: '',
    redirect: '/admin',
    component: Avatars,
    access: false,
    icon: <Icon type="Dashboard" style={{ color: 'white' }} />
  },
  server: {
    name: 'user:dashboard.server',
    scope: 'server',
    component: Server,
    access: false,
    icon: <Icon type="Storage" style={{ color: 'white' }} />
  },
  projects: {
    name: 'user:dashboard.projects',
    scope: 'projects',
    component: Projects,
    access: false,
    icon: <Icon type="Code" style={{ color: 'white' }} />
  },
  routes: {
    name: 'user:dashboard.routes',
    scope: 'routes',
    component: RoutesComp,
    access: false,
    icon: <Icon type="Shuffle" style={{ color: 'white' }} />
  },
  locations: {
    name: 'user:dashboard.locations',
    scope: 'location',
    component: Locations,
    access: false,
    icon: <Icon type="NearMe" style={{ color: 'white' }} />
  },
  instance: {
    name: 'user:dashboard.instances',
    scope: 'instance',
    component: Instance,
    access: false,
    icon: <Icon type="DirectionsRun" style={{ color: 'white' }} />
  },
  avatars: {
    name: 'user:dashboard.avatars',
    scope: 'globalAvatars',
    component: Avatars,
    access: false,
    icon: <Icon type="Accessibility" style={{ color: 'white' }} />
  },
  benchmarking: {
    name: 'user:dashboard.benchmarking',
    scope: 'benchmarking',
    component: Benchmarking,
    access: false,
    icon: <Icon type="Timeline" style={{ color: 'white' }} />
  },
  bots: {
    name: 'user:dashboard.bots',
    scope: 'bot',
    component: BotSetting,
    access: false,
    icon: <Icon type="SmartToy" style={{ color: 'white' }} />
  },
  channel: {
    name: 'user:dashboard.channels',
    scope: 'channel',
    component: Channels,
    access: false,
    icon: <Icon type="CalendarViewDay" style={{ color: 'white' }} />
  },
  invites: {
    name: 'user:dashboard.invites',
    scope: 'invite',
    component: Invites,
    access: false,
    icon: <Icon type="PersonAdd" style={{ color: 'white' }} />
  },
  recordings: {
    name: 'user:dashboard.recordings',
    scope: 'recording',
    component: Recordings,
    access: false,
    icon: <Icon type="Videocam" style={{ color: 'white' }} />
  },
  resources: {
    name: 'user:dashboard.resources',
    scope: 'static_resource',
    component: Resources,
    access: false,
    icon: <Icon type="PermMedia" style={{ color: 'white' }} />
  },
  settings: {
    name: 'user:dashboard.setting',
    scope: ['settings', clientSettingPath],
    component: Setting,
    access: false,
    icon: <Icon type="Settings" style={{ color: 'white' }} />
  },
  users: {
    name: 'user:dashboard.users',
    scope: 'user',
    component: Users,
    access: false,
    icon: <Icon type="SupervisorAccount" style={{ color: 'white' }} />
  }
}
