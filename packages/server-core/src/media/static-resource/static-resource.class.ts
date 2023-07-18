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

import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'

import { Application } from '../../../declarations'
import verifyScope from '../../hooks/verify-scope'
import { UserParams } from '../../user/user/user.class'
import { NotFoundException, UnauthenticatedException } from '../../util/exceptions/exception'
import { getStorageProvider } from '../storageprovider/storageprovider'

export class StaticResource extends Service<StaticResourceInterface> {
  app: Application
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  // gets the static resource from the database, including the variants
  async get(id: string, params?: Params): Promise<StaticResourceInterface> {
    return super.Model.findOne({
      where: { id }
    })
  }

  async find(params?: Params): Promise<Paginated<StaticResourceInterface>> {
    const search = params?.query?.search ?? ''
    const key = params?.query?.key ?? ''
    const mimeTypes = params?.query?.mimeTypes && params?.query?.mimeTypes.length > 0 ? params?.query?.mimeTypes : null

    const sort = params?.query?.$sort
    const order: any[] = []
    if (sort != null) {
      Object.keys(sort).forEach((name, val) => {
        order.push([name, sort[name] === 0 ? 'DESC' : 'ASC'])
      })
    }
    const limit = params?.query?.$limit ?? 10
    const skip = params?.query?.$skip ?? 0
    const result = await super.Model.findAndCountAll({
      limit: limit,
      offset: skip,
      select: params?.query?.$select,
      order: order,
      where: {
        key: {
          [Op.or]: {
            [Op.like]: `%${search}%`,
            [Op.eq]: key
          }
        },
        mimeType: {
          [Op.or]: mimeTypes
        }
      },
      raw: true,
      nest: true
    })

    return {
      data: result.rows,
      total: result.count,
      skip: skip,
      limit: limit
    }
  }

  async remove(id: string, params?: UserParams): Promise<StaticResourceInterface> {
    const resource = await super.get(id)

    if (!resource) {
      throw new NotFoundException('Unable to find specified resource id.')
    }

    if (!resource.userId) {
      if (params?.provider) await verifyScope('admin', 'admin')({ app: this.app, params } as any)
    } else if (params?.provider && resource.userId !== params?.user?.id)
      throw new UnauthenticatedException('You are not the creator of this resource')

    if (resource.key) {
      const storageProvider = getStorageProvider(params?.query?.storageProviderName)
      await storageProvider.deleteResources([resource.key])
    }
    return (await super.remove(id)) as StaticResourceInterface
  }
}
