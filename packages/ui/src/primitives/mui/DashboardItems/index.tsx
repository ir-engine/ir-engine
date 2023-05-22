import React from 'react'

import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

export const SidebarItems = (allowedRoutes) => [
  allowedRoutes.analytics && {
    name: 'user:dashboard.dashboard',
    path: '/admin',
    icon: <Icon type="Dashboard" style={{ color: 'white' }} />
  },
  allowedRoutes.server && {
    name: 'user:dashboard.server',
    path: '/admin/server',
    icon: <Icon type="Storage" style={{ color: 'white' }} />
  },
  allowedRoutes.projects && {
    name: 'user:dashboard.projects',
    path: '/admin/projects',
    icon: <Icon type="Code" style={{ color: 'white' }} />
  },
  allowedRoutes.routes && {
    name: 'user:dashboard.routes',
    path: '/admin/routes',
    icon: <Icon type="Shuffle" style={{ color: 'white' }} />
  },
  allowedRoutes.location && {
    name: 'user:dashboard.locations',
    path: '/admin/locations',
    icon: <Icon type="NearMe" style={{ color: 'white' }} />
  },
  allowedRoutes.instance && {
    name: 'user:dashboard.instance',
    path: '/admin/instance',
    icon: <Icon type="DirectionsRun" style={{ color: 'white' }} />
  },
  allowedRoutes.party && {
    name: 'user:dashboard.parties',
    path: '/admin/parties',
    icon: <Icon type="CalendarViewDay" style={{ color: 'white' }} />
  },
  allowedRoutes.user && {
    name: 'user:dashboard.users',
    path: '/admin/users',
    icon: <Icon type="SupervisorAccount" style={{ color: 'white' }} />
  },
  allowedRoutes.invite && {
    name: 'user:dashboard.invites',
    path: '/admin/invites',
    icon: <Icon type="PersonAdd" style={{ color: 'white' }} />
  },
  allowedRoutes.groups && {
    name: 'user:dashboard.groups',
    path: '/admin/groups',
    icon: <Icon type="GroupAdd" style={{ color: 'white' }} />
  },
  allowedRoutes.globalAvatars && {
    name: 'user:dashboard.avatars',
    path: '/admin/avatars',
    icon: <Icon type="Accessibility" style={{ color: 'white' }} />
  },
  allowedRoutes.static_resource && {
    name: 'user:dashboard.resources',
    path: '/admin/resources',
    icon: <Icon type="PermMedia" style={{ color: 'white' }} />
  },
  allowedRoutes.benchmarking && {
    name: 'user:dashboard.benchmarking',
    path: '/admin/benchmarking',
    icon: <Icon type="Timeline" style={{ color: 'white' }} />
  },
  allowedRoutes.settings && {
    name: 'user:dashboard.setting',
    path: '/admin/settings',
    icon: <Icon type="Settings" style={{ color: 'white' }} />
  },
  allowedRoutes.bot && {
    name: 'user:dashboard.bots',
    path: '/admin/bots',
    icon: <Icon type="Toys" style={{ color: 'white' }} />
  }
]
