import type { ProjectConfigInterface } from '@etherealengine/projects/ProjectConfigInterface'

const config: ProjectConfigInterface = {
  onEvent: './projectEventHooks.ts',
  thumbnail: '/static/etherealengine_thumbnail.jpg',
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
    '/home': {
      component: () => import('@etherealengine/client/src/pages/home/home')
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
    },
    '/capture': {
      component: () => import('@etherealengine/client/src/route/capture')
    }
  }
}

export default config
