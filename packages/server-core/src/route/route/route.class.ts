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

import type { NullableId, Params } from '@feathersjs/feathers'
import type { KnexAdapterOptions } from '@feathersjs/knex'
import { KnexAdapter, KnexAdapterParams } from '@feathersjs/knex'

import { RouteData, RoutePatch, RouteQuery, RouteType } from '@etherealengine/engine/src/schemas/route/route.schema'
import { Id } from '@feathersjs/feathers'
import { Application } from '../../../declarations'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RouteParams extends KnexAdapterParams<RouteQuery> {}

export class RouteService<T = RouteType, ServiceParams extends Params = RouteParams> extends KnexAdapter<
  RouteType,
  RouteData,
  RouteParams,
  RoutePatch
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: RouteParams) {
    if (params?.query?.paginate != null) {
      if (params.query.paginate === false) params.paginate = params.query.paginate
      delete params.query.paginate
    }
    return super._find(params)
  }

  async create(data: RouteData, params?: RouteParams) {
    return super._create(data, params)
  }

  async get(id: Id, params?: RouteParams) {
    return super._get(id, params)
  }

  async patch(id: Id, data: RouteData, params?: RouteParams) {
    return super._patch(id, data, params)
  }

  async remove(id: NullableId, params?: RouteParams) {
    return super._remove(id, params)
  }
}
