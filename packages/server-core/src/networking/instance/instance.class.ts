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

import { Params } from '@feathersjs/feathers'
import { KnexAdapter, type KnexAdapterOptions } from '@feathersjs/knex'

import {
  InstanceData,
  InstancePatch,
  InstanceQuery,
  InstanceType
} from '@etherealengine/engine/src/schemas/networking/instance.schema'

import { LocationType, locationPath } from '@etherealengine/engine/src/schemas/social/location.schema'
import { Application } from '../../../declarations'
import { RootParams } from '../../api/root-params'

const roomCodeCharacters = '123456789'

const generateRoomCode = () => {
  let code = ''
  for (let i = 0; i < 6; i++) code += roomCodeCharacters.charAt(Math.floor(Math.random() * roomCodeCharacters.length))
  return code
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InstanceParams extends RootParams<InstanceQuery> {}

/**
 * A class for Instance service
 */

export class InstanceService<T = InstanceType, ServiceParams extends Params = InstanceParams> extends KnexAdapter<
  InstanceType,
  InstanceData,
  InstanceParams,
  InstancePatch
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }
  /**
   * A method which searches for instances
   *
   * @param params of query with an acton or user role
   * @returns user object
   */
  async find(params?: InstanceParams) {
    const action = params?.query?.action
    const search = params?.query?.search

    if (action === 'admin') {
      const foundLocations = search
        ? ((await this.app.service(locationPath).find({
            query: { name: { $like: `%${search}%` } },
            paginate: false
          })) as any as LocationType[])
        : []

      return (await super._find({
        query: {
          ended: false,
          $or: [
            {
              ipAddress: {
                $like: `%${search}%`
              }
            },
            {
              locationId: {
                $in: foundLocations.map((item) => item.id)
              }
            }
          ]
        },
        paginate: false
      })) as any as InstanceType[]
    } else {
      return super._find(params)
    }
  }

  /**
   * A method which creates an instance
   *
   * @param data of new instance
   * @param params of query
   * @returns instance object
   */
  async create(data: InstanceData, params?: InstanceParams) {
    let existingInstances: InstanceType[] = []

    do {
      data.roomCode = generateRoomCode()
      existingInstances = (await super._find({
        query: {
          roomCode: data.roomCode,
          ended: false
        },
        paginate: false
      })) as any as InstanceType[]
    } while (existingInstances.length > 0)

    return super._create(data)
  }
}
