/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Params } from '@feathersjs/feathers'
import fs from 'fs'
import path from 'path'

import { InstalledRoutesInterface } from '@etherealengine/common/src/interfaces/Route'
import { routeMethods, routePath } from '@etherealengine/engine/src/schemas/route/route.schema'
import { ProjectConfigInterface } from '@etherealengine/projects/ProjectConfigInterface'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { RouteService } from './route.class'
import routeDocs from './route.docs'
import hooks from './route.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [routePath]: RouteService
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

export const getInstalledRoutes = () => {
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

export const activateRoute = (routeService: RouteService) => {
  return async (data: { project: string; route: string; activate: boolean }, params: Params = {}) => {
    const activatedRoutes = await routeService.find({
      paginate: false
    })
    const installedRoutes = (await getInstalledRoutes()()).data
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
    name: routePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(routePath, new RouteService(options), {
    // A list of all methods this service exposes externally
    methods: routeMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: routeDocs
  })

  const service = app.service(routePath)
  service.hooks(hooks)

  app.use('routes-installed', {
    find: getInstalledRoutes()
  })

  app.use('route-activate', {
    create: activateRoute(service)
  })
}
