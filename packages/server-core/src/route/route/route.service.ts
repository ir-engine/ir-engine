import { Params } from '@feathersjs/feathers'
import fs from 'fs'
import path from 'path'

import { ActiveRoutesInterface, InstalledRoutesInterface } from '@xrengine/common/src/interfaces/Route'
import { ProjectConfigInterface } from '@xrengine/projects/ProjectConfigInterface'

import { Application } from '../../../declarations'
import { Route } from './route.class'
import routeDocs from './route.docs'
import hooks from './route.hooks'
import createModel from './route.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    route: Route
  }
}

export const getInstalledRoutes = async () => {
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
            await import(`@xrengine/projects/projects/${project}/xrengine.config.ts`)
          ).default
          data.push({
            routes: Object.keys(projectConfig.routes!),
            project
          })
        }
      } catch (e) {
        console.warn('[getProjects]: Failed to read config for project', project, 'with error', e)
        return
      }
    })
  )
  return { data }
}

export const activateRoute = (routeService: Route): any => {
  return async (data: { project: string; route: string; activate: boolean }, params: Params) => {
    const activatedRoutes = ((await routeService.find(null!)) as any).data as ActiveRoutesInterface[]
    const installedRoutes = (await getInstalledRoutes()).data
    if (data.activate) {
      const routeToActivate = installedRoutes.find((r) => r.project === data.project && r.routes.includes(data.route))
      if (routeToActivate) {
        // if any projects already have this route, deactivate them
        for (const route of activatedRoutes) {
          if (route.route === data.route) await routeService.remove(route.id)
        }
        await routeService.create({
          route: data.route,
          project: data.project
        })
        return true
      }
    } else {
      const routeToDeactivate = activatedRoutes.find((r) => r.project === data.project && r.route === data.route)
      if (routeToDeactivate) {
        await routeService.remove(routeToDeactivate.id)
        return true
      }
    }
    return false
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new Route(options, app)
  event.docs = routeDocs
  app.use('route', event)
  // @ts-ignore
  app.use('routes-installed', {
    find: getInstalledRoutes
  })
  // @ts-ignore
  app.use('route-activate', {
    create: activateRoute(event)
  })

  const service = app.service('route')

  service.hooks(hooks)
}
