/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

// This must always be imported first
import '@ir-engine/server-core/src/patchEngineNode'

import { Application } from '@feathersjs/feathers'
import cli from 'cli'

import { InstalledRoutesInterface } from '@ir-engine/common/src/interfaces/Route'
import { routePath } from '@ir-engine/common/src/schema.type.module'
import { createFeathersKoaApp, serverJobPipe } from '@ir-engine/server-core/src/createApp'
import { getStorageProvider } from '@ir-engine/server-core/src/media/storageprovider/storageprovider'
import { ServerMode } from '@ir-engine/server-core/src/ServerState'

cli.enable('status')

const PAGE_SIZE = 100

const getAllRoutes = async (app: Application, routes: InstalledRoutesInterface[], skip: number) => {
  const routePage = await app.service(routePath).find({
    query: {
      $limit: PAGE_SIZE,
      $skip: skip
    }
  })
  routes = routes.concat(routePage.data)
  if (routePage.total > routes.length) return await getAllRoutes(app, routes, skip + PAGE_SIZE)
  else return routes
}

const options = cli.parse({
  stage: [true, 'Name of Release', 'string']
})
cli.main(async () => {
  try {
    const app = await createFeathersKoaApp(ServerMode.API, serverJobPipe)
    await app.setup()
    const storageProvider = getStorageProvider()
    const routes = (await getAllRoutes(app, [], 0)).map((item) => item.route)
    const name = `ir-engine-${options.stage}-client-route-function`
    const functionList = (await storageProvider.listFunctions(null, [])).map((thisFunction) => thisFunction.Name)
    const currentFunctions = [...new Set(functionList)]
    let functionResponse
    if (currentFunctions.indexOf(name) >= 0) functionResponse = await storageProvider.updateFunction(name, routes)
    else functionResponse = await storageProvider.createFunction(name, routes)
    await storageProvider.publishFunction(name)
    await storageProvider.associateWithFunction(functionResponse.FunctionSummary.FunctionMetadata.FunctionARN)
    console.log('Updated Cloudfront Distribution with client route function')
    process.exit(0)
  } catch (err) {
    console.log('Error in creating or updating Cloudfront client route function:')
    console.log(err)
    cli.fatal(err)
  }
})
