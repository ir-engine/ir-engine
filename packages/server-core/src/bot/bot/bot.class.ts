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

import { Id, NullableId, Params } from '@feathersjs/feathers'
import type { KnexAdapterOptions } from '@feathersjs/knex'
import { KnexAdapter } from '@feathersjs/knex'

import { BotData, BotPatch, BotQuery, BotType } from '@etherealengine/engine/src/schemas/bot/bot.schema'

import { botCommandPath } from '@etherealengine/engine/src/schemas/bot/bot-command.schema'
import { InstanceID } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { Application } from '../../../declarations'
import { RootParams } from '../../api/root-params'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BotParams extends RootParams<BotQuery> {}

/**
 * A class for Bot service
 */

export class BotService<T = BotType, ServiceParams extends Params = BotParams> extends KnexAdapter<
  BotType,
  BotData,
  BotParams,
  BotPatch
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: BotParams) {
    return super._find(params)
  }

  async create(data: BotData, params?: BotParams) {
    data.instanceId = data.instanceId ? data.instanceId : ('' as InstanceID)

    const dataWithoutExtras = { ...data } as any
    delete dataWithoutExtras.botCommands

    const result = await super._create(dataWithoutExtras)
    result.botCommands = []

    for (const element of data.botCommands) {
      const command = await this.app.service(botCommandPath).create({
        ...element,
        botId: result.id
      })
      result.botCommands.push(command)
    }
    return result
  }

  async patch(id: NullableId, data: BotPatch, _params?: BotParams) {
    return super._patch(id, data)
  }

  async remove(id: Id, _params?: BotParams) {
    return super._remove(id, _params)
  }
}
