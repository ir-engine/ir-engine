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

import type { Params } from '@feathersjs/feathers'
import type { KnexAdapterOptions } from '@feathersjs/knex'
import { KnexAdapter } from '@feathersjs/knex'

import { checkScope } from '@etherealengine/engine/src/common/functions/checkScope'
import {
  RecordingData,
  RecordingID,
  RecordingPatch,
  RecordingQuery,
  RecordingType
} from '@etherealengine/engine/src/schemas/recording/recording.schema'
import { NotFound } from '@feathersjs/errors'
import { Application } from '../../../declarations'
import { RootParams } from '../../api/root-params'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RecordingParams extends RootParams<RecordingQuery> {}

export class RecordingService<T = RecordingType, ServiceParams extends Params = RecordingParams> extends KnexAdapter<
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
    return await super._get(id, params)
  }

  async find(params?: RecordingParams) {
    let paramsWithoutExtras = {
      ...params,
      // Explicitly cloned sort object because otherwise it was affecting default params object as well.
      query: params?.query ? JSON.parse(JSON.stringify(params?.query)) : {}
    }
    paramsWithoutExtras = { ...paramsWithoutExtras, query: { ...paramsWithoutExtras.query, userId: params?.user?.id } }

    if (params && params.user && params.query) {
      const admin = await checkScope(params.user, 'admin', 'admin')
      if (admin && params.query.action === 'admin') {
        // show admin page results only if user is admin and query.action explicitly is admin (indicates admin panel)
        if (paramsWithoutExtras.query?.userId || paramsWithoutExtras.query?.userId === '')
          delete paramsWithoutExtras.query.userId
      }
    }

    // Remove recording username sort
    if (paramsWithoutExtras.query?.$sort && paramsWithoutExtras.query?.$sort['user']) {
      delete paramsWithoutExtras.query.$sort['user']
    }

    // Remove extra params
    if (paramsWithoutExtras.query?.action || paramsWithoutExtras.query?.action === '')
      delete paramsWithoutExtras.query.action

    return super._find(paramsWithoutExtras)
  }

  async create(data: RecordingData, params?: RecordingParams) {
    return super._create({
      ...data,
      userId: params?.user?.id
    })
  }

  async remove(id: RecordingID) {
    const recording = super._get(id)
    if (!recording) {
      throw new NotFound('Unable to find recording with this id')
    }
    return super._remove(id)
  }

  async patch(id: RecordingID, data: RecordingPatch, params?: RecordingParams) {
    return await super._patch(id, data, params)
  }
}
