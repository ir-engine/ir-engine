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

import React, { lazy } from 'react'
import { HiOutlineCube } from 'react-icons/hi'
import {
  HiMapPin,
  HiMiniShieldExclamation,
  HiOutlineCog6Tooth,
  HiOutlineGlobeAlt,
  HiOutlineMegaphone,
  HiOutlineTableCells,
  HiPlay,
  HiServer,
  HiUser,
  HiUserCircle
} from 'react-icons/hi2'
import { RiSendPlaneFill } from 'react-icons/ri'

import { clientSettingPath } from '@ir-engine/common/src/schema.type.module'

import { AdminRouteStateType } from './AllowedAdminRoutesState'

const Avatars = lazy(() => import('./components/avatar'))

const Invites = lazy(() => import('./components/invites'))

const Projects = lazy(() => import('./components/project'))

const Users = lazy(() => import('./components/user'))

const Locations = lazy(() => import('./components/locations'))

const Servers = lazy(() => import('./components/server'))

const Instances = lazy(() => import('./components/instance'))

const Resources = lazy(() => import('./components/resources'))

const Recordings = lazy(() => import('./components/recordings'))

const Routes = lazy(() => import('./components/routes'))

const Settings = lazy(() => import('./components/settings'))

const Channels = lazy(() => import('./components/channel'))

const CrashReport = lazy(() => import('./components/crash-report'))

export const DefaultAdminRoutes: Record<string, AdminRouteStateType> = {
  settings: {
    name: 'user:dashboard.setting',
    scope: ['settings', clientSettingPath],
    component: Settings,
    access: false,
    icon: <HiOutlineCog6Tooth />
  },
  projects: {
    name: 'user:dashboard.projects',
    scope: 'projects',
    component: Projects,
    access: false,
    icon: <HiOutlineTableCells />
  },
  locations: {
    name: 'user:dashboard.locations',
    scope: 'location',
    component: Locations,
    access: false,
    icon: <HiMapPin />
  },
  instances: {
    name: 'user:dashboard.instances',
    scope: 'instance',
    component: Instances,
    access: false,
    icon: <HiOutlineCube />
  },
  servers: {
    name: 'user:dashboard.server',
    scope: 'server',
    component: Servers,
    access: false,
    icon: <HiServer />
  },
  avatars: {
    name: 'user:dashboard.avatars',
    scope: 'globalAvatars',
    component: Avatars,
    access: false,
    icon: <HiUserCircle />
  },
  users: {
    name: 'user:dashboard.users',
    scope: 'user',
    component: Users,
    access: false,
    icon: <HiUser />
  },
  invites: {
    name: 'user:dashboard.invites',
    scope: 'invite',
    component: Invites,
    access: false,
    icon: <RiSendPlaneFill />
  },
  recordings: {
    name: 'user:dashboard.recordings',
    scope: 'recording',
    component: Recordings,
    access: false,
    icon: <HiPlay />
  },
  resources: {
    name: 'user:dashboard.resources',
    scope: 'static_resource',
    component: Resources,
    access: false,
    icon: <HiOutlineTableCells />
  },
  routes: {
    name: 'user:dashboard.routes',
    scope: 'routes',
    component: Routes,
    access: false,
    icon: <HiOutlineGlobeAlt />
  },
  channel: {
    name: 'user:dashboard.channels',
    scope: 'channel',
    component: Channels,
    access: false,
    icon: <HiOutlineMegaphone />
  },
  crashes: {
    name: 'user:dashboard.crashReport',
    scope: 'server',
    component: CrashReport,
    access: false,
    icon: <HiMiniShieldExclamation />
  }
}
