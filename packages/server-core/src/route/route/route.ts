import { Params } from '@feathersjs/feathers'
import fs from 'fs'
import path from 'path'

import { InstalledRoutesInterface } from '@etherealengine/common/src/interfaces/Route'
import { ProjectConfigInterface } from '@etherealengine/projects/ProjectConfigInterface'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { RouteService } from './route.class'
import routeDocs from './route.docs'
import hooks from './route.hooks'
import { RouteType } from './route.schema'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    route: RouteService
  }

  interface ServiceTypes {
    'route-activate': {
      create: ReturnType<typeof activateRoute>
    }
  }

  interface ServiceTypes {
    'routes-installed': {
      find: ReturnType<typeof getInstalledRoutes>
    }
  }
}

export const getInstalledRoutes = (): any => {
  return async () => {
    const projects = fs
      .readdirSync(path.resolve(__dirname, '../../../../projects/projects/'), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    const data: InstalledRoutesInterface[] = []
    await Promise.all(
      projects.map(async (project) => {
        try {
          if (fs.existsSync(path.resolve(__dirname, `../../../../projects/projects/${project}/xrengine.config.ts`))) {
            const projectConfig: ProjectConfigInterface = (
              await import(`@etherealengine/projects/projects/${project}/xrengine.config.ts`)
            ).default
            data.push({
              routes: Object.keys(projectConfig.routes!),
              project
            })
          }
        } catch (e) {
          logger.error(e, `[getProjects]: Failed to read config for project "${project}" with error: ${e.message}`)
          return
        }
      })
    )
    return { data }
  }
}

export const activateRoute = (routeService: RouteService): any => {
  return async (data: { project: string; route: string; activate: boolean }, params: Params) => {
    const activatedRoutes = (await routeService.find(null!) as any).data as RouteType[]
    const installedRoutes = (await getInstalledRoutes()()).data
    if (data.activate) {
      const routeToActivate = installedRoutes.find((r) => r.project === data.project && r.routes.includes(data.route))
      if (routeToActivate) {
        // if any projects already have this route, deactivate them
        for (const route of activatedRoutes) {
          if (route.route === data.route) await routeService._remove(route.id)
        }
        await routeService._create({
          route: data.route,
          project: data.project
        })
        return true
      }
    } else {
      const routeToDeactivate = activatedRoutes.find((r) => r.project === data.project && r.route === data.route)
      if (routeToDeactivate) {
        await routeService._remove(routeToDeactivate.id)
        return true
      }
    }
    return false
  }
}

export default (app: Application): void => {
  const options = {
    name: 'route',
    paginate: app.get('paginate'),
    Model: app.get('mysqlClient'),
    multi: true
  }

  const event = new RouteService(options, app)
  event.docs = routeDocs
  app.use('route', event)
  // @ts-ignore
  app.use('routes-installed', {
    find: getInstalledRoutes()
  })
  // @ts-ignore
  app.use('route-activate', {
    create: activateRoute(event)
  })

  const service = app.service('route')

  service.hooks(hooks)
}
