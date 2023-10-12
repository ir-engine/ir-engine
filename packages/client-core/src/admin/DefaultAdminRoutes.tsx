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
    scope: 'settings',
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
