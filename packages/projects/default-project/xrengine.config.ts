import type { ProjectConfigInterface } from '@etherealengine/projects/ProjectConfigInterface'

const config: ProjectConfigInterface = {
  onEvent: './projectEventHooks.ts',
  thumbnail: '/static/etherealengine.png',
  routes: {
    '/': {
      component: () => import('@etherealengine/client/src/pages/index'),
      props: {
        exact: true
      }
    },
    '/admin': {
      component: () => import('@etherealengine/client-core/src/admin/adminRoutes')
    },
    '/location': {
      component: () => import('@etherealengine/client/src/pages/location/location')
    },
    '/auth': {
      component: () => import('@etherealengine/client/src/pages/auth/authRoutes')
    },
    '/editor': {
      component: () => import('@etherealengine/client/src/pages/editor/editor')
    },
    '/studio': {
      component: () => import('@etherealengine/client/src/pages/editor/editor')
    },
    '/room': {
      component: () => import('@etherealengine/client/src/pages/room')
    }
  },
  services: undefined,
  databaseSeed: undefined
}

export default config
