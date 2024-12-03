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

import { pipe } from '@ir-engine/common/src/utils/pipe'
import { Application } from '@ir-engine/server-core/declarations'
import config from '@ir-engine/server-core/src/appconfig'
import {
  configureK8s,
  configurePrimus,
  configureRedis,
  createFeathersKoaApp
} from '@ir-engine/server-core/src/createApp'
import multiLogger from '@ir-engine/server-core/src/ServerLogger'
import { ServerMode } from '@ir-engine/server-core/src/ServerState'

import collectAnalytics from './collect-analytics'
import collectEvents from './collect-events'

const logger = multiLogger.child({ component: 'taskserver' })

process.on('unhandledRejection', (error, promise) => {
  logger.error(error, 'UNHANDLED REJECTION - Promise: %o', promise)
})

const taskServerPipe = pipe(configurePrimus(), configureRedis(), configureK8s())

export const start = async (): Promise<Application> => {
  const app = await createFeathersKoaApp(ServerMode.Task, taskServerPipe)

  app.set('host', config.server.local ? config.server.hostname + ':' + config.server.port : config.server.hostname)
  app.set('port', config.server.port)

  collectAnalytics(app)
  collectEvents(app)
  logger.info('Task server running.')

  const port = Number(config['task-server'].port) || 5050

  await app.listen(port)

  logger.info('Started listening on ' + port)

  process.on('unhandledRejection', (error, promise) => {
    logger.error(error, 'UNHANDLED REJECTION - Promise: %o', promise)
  })

  return app
}
