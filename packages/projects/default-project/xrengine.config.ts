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
    },
    '/inventory': {
      component: () => import('@xrengine/client-core/src/user/components/UserMenu/Inventory/index')
    },
    '/trading': {
      component: () => import('@xrengine/client-core/src/user/components/UserMenu/Trading/index')
    },
    '/wallet': {
      component: () => import('@xrengine/client-core/src/user/components/UserMenu/Wallet/index')
    }
  },
  services: undefined,
  databaseSeed: undefined
}

export default config
