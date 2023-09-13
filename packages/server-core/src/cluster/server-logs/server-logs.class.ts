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

import { BadRequest } from '@feathersjs/errors/lib'
import { ServiceInterface } from '@feathersjs/feathers'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { RootParams } from '../../api/root-params'
import { getServerLogs } from './server-logs-helper'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServerLogsParams extends RootParams {}

/**
 * A class for Server Logs service
 */
export class ServerLogsService implements ServiceInterface<string, ServerLogsParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async find(params?: ServerLogsParams) {
    if (!params?.query?.podName) {
      logger.info('podName is required in request to find server logs')
      throw new BadRequest('podName is required in request to find server logs')
    } else if (!params?.query?.containerName) {
      logger.info('containerName is required in request to find server logs')
      throw new BadRequest('containerName is required in request to find server logs')
    }

    return getServerLogs(params?.query?.podName, params?.query?.containerName, this.app)
  }
}
