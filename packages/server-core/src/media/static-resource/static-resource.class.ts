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

import {
  StaticResourceData,
  StaticResourcePatch,
  StaticResourceQuery,
  StaticResourceType
} from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import { Forbidden, NotFound } from '@feathersjs/errors'
import { NullableId, Params } from '@feathersjs/feathers'
import { KnexAdapter, KnexAdapterOptions } from '@feathersjs/knex'
import { Application } from '../../../declarations'
import { RootParams } from '../../api/root-params'
import verifyScope from '../../hooks/verify-scope'
import { getStorageProvider } from '../storageprovider/storageprovider'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StaticResourceParams extends RootParams<StaticResourceQuery> {}

export class StaticResourceService<
  T = StaticResourceType,
  ServiceParams extends Params = StaticResourceParams
> extends KnexAdapter<StaticResourceType, StaticResourceData, StaticResourceParams, StaticResourcePatch> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  // gets the static resource from the database, including the variants
  async get(id: string, params?: StaticResourceParams) {
    return super._get(id, params)
  }

  async create(data: StaticResourceData, params?: StaticResourceParams) {
    return super._create({
      ...data,
      userId: params?.user?.id
    })
  }

  async find(params?: StaticResourceParams) {
    return super._find(params)
  }

  async patch(id: NullableId, data: StaticResourcePatch, params?: StaticResourceParams) {
    return super._patch(id, data, params)
  }

  async remove(id: string, params?: StaticResourceParams) {
    const resource = await super._get(id)

    if (!resource) {
      throw new NotFound('Unable to find specified resource id.')
    }

    if (!resource.userId) {
      if (params?.provider) await verifyScope('admin', 'admin')({ app: this.app, params } as any)
    } else if (params?.provider && resource.userId !== params?.user?.id)
      throw new Forbidden('You are not the creator of this resource')

    if (resource.key) {
      const storageProvider = getStorageProvider(params?.query?.storageProviderName)
      await storageProvider.deleteResources([resource.key])
    }
    return await super._remove(id)
  }
}
