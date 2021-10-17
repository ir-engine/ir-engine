import { Params } from '@feathersjs/feathers'
import hooks from './route.hooks'
import { Application } from '../../../declarations'
import { Route } from './route.class'
import createModel from './route.model'
import routeDocs from './route.docs'
import fs from 'fs'
import path from 'path'
import { InstalledRoutesInterface, ActiveRoutesInterface } from '@xrengine/common/src/interfaces/Route'

declare module '../../../declarations' {
  interface ServiceTypes {
    route: Route
  }
}

export const getInstalledRoutes = () => {
  const projects = fs
    .readdirSync(path.resolve(__dirname, '../../../../projects/projects/'), { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  const data: InstalledRoutesInterface[] = []
  projects.forEach(async (project) => {
    try {
      const { routes } = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, `../../../../projects/projects/${project}/routes.json`), 'utf8')
      )
      data.push({
        routes,
        project
      })
    } catch (e) {
      console.warn('[getProjects]: Failed to read routes.json for project', project, 'with error', e)
      return
    }
  })
  return { data }
}

export const activateRoute = (routeService: Route): any => {
  return async (data: { project: string; route: string; activate: boolean }, params: Params) => {
    const activatedRoutes = ((await routeService.find()) as any).data as ActiveRoutesInterface[]
    console.log(activatedRoutes)
    const installedRoutes = getInstalledRoutes().data
    console.log(installedRoutes)
    if (data.activate) {
      console.log('activating', data, '\n')
      const routeToActivate = installedRoutes.find((r) => r.project === data.project && r.routes.includes(data.route))
      console.log('routeToActivate', routeToActivate)
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
      console.log('deactivating', data, '\n')
      const routeToDeactivate = activatedRoutes.find((r) => r.project === data.project && r.route === data.route)
      console.log('routeToDeactivate', routeToDeactivate)
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
