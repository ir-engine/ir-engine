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

import type { PaginationOptions, Params } from '@feathersjs/feathers'
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex'
import { KnexService } from '@feathersjs/knex'
import { UserParams } from '../../user/user/user.class'

import { recordingResourcePath } from '@etherealengine/engine/src/schemas/recording/recording-resource.schema'
import {
  RecordingData,
  RecordingID,
  RecordingPatch,
  RecordingQuery,
  RecordingType
} from '@etherealengine/engine/src/schemas/recording/recording.schema'
import { Application } from '../../../declarations'
import { checkScope } from '../../hooks/verify-scope'
import { NotFoundException, UnauthorizedException } from '../../util/exceptions/exception'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RecordingParams extends KnexAdapterParams<RecordingQuery> {}

export class RecordingService<T = RecordingType, ServiceParams extends Params = RecordingParams> extends KnexService<
  RecordingType,
  RecordingData,
  RecordingParams,
  RecordingPatch
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: RecordingID, params?: RecordingParams) {
    // get resources with associated URLs
    // TODO: move resources population to resolvers once this service is migrated to feathers 5
    const resources = await this.app.service(recordingResourcePath).find({
      query: {
        recordingId: id
      },
      paginate: false
    })

    const result = await super._get(id, params)

    result.resources = resources.map((resource) => resource.staticResource)

    return result
  }

  async find(
    params?: UserParams & {
      paginate?: PaginationOptions | false
    }
  ) {
    if (params && params.user && params.query) {
      const admin = await checkScope(params.user, this.app, 'admin', 'admin')
      if (admin && params.query.action === 'admin') {
        delete params.query.action
        // show admin page results only if user is admin and query.action explicitly is admin (indicates admin panel)
        params.sequelize = {
          include: [{ model: this.app.service('user').Model, attributes: ['name'], as: 'user' }]
        }
        return super._find({ ...params })
      }
    }

    params!.query = {
      ...params!.query,
      query: {
        userId: params?.user!.id
      }
    }

    return super._find(params)
  }

  async create(data?: any, params?: any) {
    return super._create({
      ...data,
      userId: params.user.id
    })
  }

  async remove(id: RecordingID, params?: UserParams) {
    if (params && params.user && params.query) {
      const admin = await checkScope(params.user, this.app, 'admin', 'admin')
      if (admin) {
        const recording = super._get(id)
        if (!recording) {
          throw new NotFoundException('Unable to find recording with this id')
        }
        return super._remove(id)
      }
    }
    throw new UnauthorizedException('This action can only be performed by admins')
  }
}
