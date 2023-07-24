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

import { Paginated } from '@feathersjs/feathers/lib'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'

import { Application } from '../../../declarations'
import { checkScope } from '../../hooks/verify-scope'
import { UserParams } from '../../user/user/user.class'
import { NotFoundException, UnauthorizedException } from '../../util/exceptions/exception'

export type RecordingDataType = RecordingResult

export class Recording<T = RecordingDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: string, params?: any): Promise<T> {
    // get resources with associated URLs
    const resources = await this.app.service('recording-resource').Model.findAndCountAll({
      where: {
        recordingId: id
      },
      include: [
        {
          model: this.app.service('static-resource').Model,
          attributes: ['id', 'key']
        }
      ]
    })

    const result = (await super.get(id)) as RecordingDataType

    result.resources = resources.rows.map((resource) => resource.static_resource.key)

    return result as T
  }

  async find(params?: UserParams): Promise<Paginated<T>> {
    if (params && params.user && params.query) {
      const admin = await checkScope(params.user, this.app, 'admin', 'admin')
      if (admin && params.query.action === 'admin') {
        delete params.query.action
        // show admin page results only if user is admin and query.action explicitly is admin (indicates admin panel)
        params.sequelize = {
          include: [{ model: this.app.service('user').Model, attributes: ['name'], as: 'user' }]
        }
        return super.find({ ...params }) as Promise<Paginated<T>>
      }
    }
    return super.find({
      query: {
        userId: params?.user!.id
      }
    }) as Promise<Paginated<T>>
  }

  async create(data?: any, params?: any): Promise<T | T[]> {
    return super.create({
      ...data,
      userId: params.user.id
    })
  }

  async remove(id: RecordingResult['id'], params?: UserParams) {
    if (params && params.user && params.query) {
      const admin = await checkScope(params.user, this.app, 'admin', 'admin')
      if (admin) {
        const recording = super.get(id)
        if (!recording) {
          throw new NotFoundException('Unable to find recording with this id')
        }
        return super.remove(id)
      }
    }
    throw new UnauthorizedException('This action can only be performed by admins')
  }
}
