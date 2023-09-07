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

import { Id, Params } from '@feathersjs/feathers'
import type { KnexAdapterOptions } from '@feathersjs/knex'
import { KnexAdapter } from '@feathersjs/knex'

import { ScopeData, ScopePatch, ScopeQuery, ScopeType } from '@etherealengine/engine/src/schemas/scope/scope.schema'

import { Application } from '../../../declarations'
import { RootParams } from '../../api/root-params'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ScopeParams extends RootParams<ScopeQuery> {}

/**
 * A class for Scope service
 */

export class ScopeService<T = ScopeType, ServiceParams extends Params = ScopeParams> extends KnexAdapter<
  ScopeType,
  ScopeData,
  ScopeParams,
  ScopePatch
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: ScopeParams) {
    if (params?.query?.paginate != null) {
      if (params.query.paginate === false) params.paginate = params.query.paginate
      delete params.query.paginate
    }
    return super._find(params)
  }

  async create(data: ScopeData | ScopeData[], params?: ScopeParams) {
    if (!Array.isArray(data)) {
      data = [data]
    }
    const queryParams = { userId: data[0].userId }

    const oldScopes = (await super._find({
      query: queryParams,
      paginate: false
    })) as any as ScopeType[]

    let existingData: ScopeData[] = []
    let createData: ScopeData[] = []

    for (const item of data) {
      const existingScope = oldScopes && oldScopes.find((el) => el.type === item.type)
      if (existingScope) {
        existingData.push(existingScope)
      } else {
        createData.push(item)
      }
    }

    if (createData.length > 0) {
      const createdData: any = await super._create(data)
      return [...existingData, ...createdData]
    }

    return existingData
  }

  async remove(id: Id, _params?: ScopeParams) {
    return super._remove(id, _params)
  }
}
