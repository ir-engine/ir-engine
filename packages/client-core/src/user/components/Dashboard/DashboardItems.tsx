import {
  Accessibility,
  CalendarViewDay,
  Code,
  Dashboard as DashboardIcon,
  DirectionsRun,
  GroupAdd,
  NearMe,
  PersonAdd,
  Settings,
  Shuffle,
  SupervisorAccount,
  Timeline,
  Toys
} from '@mui/icons-material'
import React from 'react'

export const SidebarItems = (allowedRoutes) => [
  {
    name: 'user:dashboard.dashboard',
    path: '/admin',
    icon: <DashboardIcon style={{ color: 'white' }} />
  },
  allowedRoutes.projects && {
    name: 'user:dashboard.projects',
    path: '/admin/projects',
    icon: <Code style={{ color: 'white' }} />
  },
  allowedRoutes.routes && {
    name: 'user:dashboard.routes',
    path: '/admin/routes',
    icon: <Shuffle style={{ color: 'white' }} />
  },
  allowedRoutes.location && {
    name: 'user:dashboard.locations',
    path: '/admin/locations',
    icon: <NearMe style={{ color: 'white' }} />
  },
  allowedRoutes.instance && {
    name: 'user:dashboard.instance',
    path: '/admin/instance',
    icon: <DirectionsRun style={{ color: 'white' }} />
  },
  allowedRoutes.party && {
    name: 'user:dashboard.parties',
    path: '/admin/parties',
    icon: <CalendarViewDay style={{ color: 'white' }} />
  },
  allowedRoutes.user && {
    name: 'user:dashboard.users',
    path: '/admin/users',
    icon: <SupervisorAccount style={{ color: 'white' }} />
  },
  allowedRoutes.invites && {
    name: 'user:dashboard.invites',
    path: '/admin/invites',
    icon: <PersonAdd style={{ color: 'white' }} />
  },
  allowedRoutes.groups && {
    name: 'user:dashboard.groups',
    path: '/admin/groups',
    icon: <GroupAdd style={{ color: 'white' }} />
  },
  allowedRoutes.globalAvatars && {
    name: 'user:dashboard.avatars',
    path: '/admin/avatars',
    icon: <Accessibility style={{ color: 'white' }} />
  },
  allowedRoutes.benchmarking && {
    name: 'user:dashboard.benchmarking',
    path: '/admin/benchmarking',
    icon: <Timeline style={{ color: 'white' }} />
  },
  {
    name: 'user:dashboard.setting',
    path: '/admin/settings',
    icon: <Settings style={{ color: 'white' }} />
  },
  allowedRoutes.bot && {
    name: 'user:dashboard.bots',
    path: '/admin/bots',
    icon: <Toys style={{ color: 'white' }} />
  }
]
