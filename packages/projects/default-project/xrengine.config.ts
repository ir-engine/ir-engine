import { DataTypes } from 'sequelize'

import type { ProjectConfigInterface } from '@xrengine/projects/ProjectConfigInterface'

const config: ProjectConfigInterface = {
  onEvent: './projectEventHooks.ts',
  thumbnail: '/static/xrengine_thumbnail.jpg',
  routes: {
    '/': {
      component: () => import('@xrengine/client/src/pages/index'),
      props: {
        exact: true
      }
    },
    '/login': {
      component: () => import('@xrengine/client/src/pages/login')
    },
    '/admin': {
      component: () => import('@xrengine/client-core/src/admin/adminRoutes')
    },
    '/location': {
      component: () => import('@xrengine/client/src/pages/location/location')
    },
    '/auth': {
      component: () => import('@xrengine/client/src/pages/auth/authRoutes')
    },
    '/editor': {
      component: () => import('@xrengine/client/src/pages/editor/editor')
    },
    '/examples': {
      component: () => import('@xrengine/client/src/pages/examples/index')
    }
  },
  services: undefined,
  databaseSeed: undefined,
  settings: [
    {
      settingName: 'secret1', // string
      type: DataTypes.STRING, // typeof sequelize.DataTypes
      scopes: ['editor:write'] // optional, default to admin only
    },
    {
      settingName: 'secret2', // string
      type: DataTypes.NUMBER, // typeof sequelize.DataTypes
      scopes: [] // optional, default to admin only
    }
  ]
}

export default config
