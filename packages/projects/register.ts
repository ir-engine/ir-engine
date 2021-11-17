interface ProjectConfigInterface {
  thumbnail: string
  routes: {
    [route: string]: () => Promise<{ default: (props: any) => JSX.Element }>
  }
  scenes: {
    [route: string]: () => Promise<{ default: (props: any) => JSX.Element }>
  }
}

export const registerProject = (config: ProjectConfigInterface) => {}

/**
 * 
import { registerProject } from '../../register'

registerProject({
    thumbnail: "https://assets.website-files.com/<whatever>.png",
    routes: {
        '/': () => import('@xrengine/client/src/pages/index'),
        '/login': () => import('@xrengine/client/src/pages/login'),
        '/harmony': () => import('@xrengine/client/src/pages/harmony/index'),
        '/admin': () => import('@xrengine/client-core/src/admin/adminRoutes'),
        '/location': () => import('@xrengine/client/src/pages/location/location'),
        '/auth': () => import('@xrengine/client/src/pages/auth/authRoutes'),
        '/editor': () => import('@xrengine/client/src/pages/editor/editor')
    },
    scenes: {
        'test': {
            scene: () => import('./scenes/test.world'),
            settings: {}
        }
    }
})
 */
