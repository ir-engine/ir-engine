import { Params } from '@feathersjs/feathers'
import hooks from './route.hooks'
import { Application } from '../../../declarations'
import { Route } from './route.class'
import createModel from './route.model'
import routeDocs from './route.docs'
import fs from 'fs'
import path from 'path'

declare module '../../../declarations' {
  interface ServiceTypes {
    route: Route
  }
}

export const getInstalledRoutes = () => {
  return async (params: Params) => {
    const projects = fs
      .readdirSync(path.resolve(__dirname, '../../../../projects/projects/'), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    const data: any[] = []
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
        console.warn('[getRealityPacks]: Failed to read manifest.json for reality pack', dir, 'with error', e)
        return
      }
    })
    return { data }
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
    find: getInstalledRoutes()
  })

  const service = app.service('route')

  service.hooks(hooks)
}
