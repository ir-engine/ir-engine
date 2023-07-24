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

import { Id, Paginated, Params } from '@feathersjs/feathers'
import { KnexAdapter } from '@feathersjs/knex'
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex'

import { Party as PartyDataType } from '@etherealengine/common/src/interfaces/Party'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import {
  PartyData,
  PartyPatch,
  partyPath,
  PartyQuery,
  PartyType
} from '@etherealengine/engine/src/schemas/social/party/party.schema'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { UserParams } from '../../user/user/user.class'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PartyParams extends KnexAdapterParams<PartyQuery> {
  user: UserInterface
}

/**
 * A class for Party service
 */
export class PartyService<T = PartyType, ServiceParams extends Params = PartyParams> extends KnexAdapter<
  PartyType,
  PartyData,
  PartyParams,
  PartyPatch
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: PartyParams) {
    const { action, $skip, $limit, search, ...query } = params?.query ?? {}
    const skip = $skip ? $skip : 0
    const limit = $limit ? $limit : 10

    if (action === 'admin') {
      const sort = params?.query?.$sort
      delete query.$sort
      const order: any[] = []
      if (sort != null) {
        Object.keys(sort).forEach((name, val) => {
          const item: any[] = []

          if (name === 'instance') {
            //item.push(this.app.service('instance').Model)
            item.push(Sequelize.literal('`instance.ipAddress`'))
          } else {
            item.push(name)
          }
          item.push(sort[name] === 0 ? 'DESC' : 'ASC')

          order.push(item)
        })
      }
      let ip = {}
      let name = {}
      if (!isNaN(search)) {
        ip = search ? { ipAddress: { [Op.like]: `%${search}%` } } : {}
      } else {
        name = search ? { name: { [Op.like]: `%${search}%` } } : {}
      }

      const party = await (this.app.service('party') as any).Model.findAndCountAll({
        offset: skip,
        limit: limit,
        order: order,
        include: [
          {
            model: (this.app.service('party-user') as any).Model
          }
        ]
      })

      return {
        skip: skip,
        limit: limit,
        total: party.count,
        data: party.rows
      }
    } else {
      return super._find(params)
    }
  }

  /**
   * A function which used to get specific party
   *
   * @param id of specific party
   * @param params contains user info
   * @returns {@Object} of single party
   */
  async get(id: Id, params?: PartyParams) {
    if (id == null || id == '') {
      const user = params!.user as UserInterface
      if (user.partyId)
        try {
          const party = (await super._get(user.partyId)) as any
          party.party_users = (
            await this.app.service('party-user').find({
              query: {
                partyId: user.partyId
              }
            })
          ).data
          return party
        } catch (err) {
          return null!
        }
    } else {
      return super._get(id, params)
    }
    return null!
  }

  async create(data: PartyData, params?: PartyParams) {
    const self = this
    if (!params) return null!
    const userId = params!.user!.id

    try {
      const existingPartyUsers = await this.app.service('party-user')._find({
        query: {
          userId: userId
        }
      })

      await Promise.all(
        existingPartyUsers.data.map(
          (partyUser) =>
            new Promise<void>(async (resolve, reject) => {
              try {
                await self.app.service('party-user')._remove(partyUser.id)
                resolve()
              } catch (err) {
                reject(err)
              }
            })
        )
      )

      const party = (await super._create(data)) as any

      await this.app.service('party-user')._create({
        partyId: party.id,
        isOwner: true,
        userId: userId
      })

      await this.app.service('user')._patch(userId, {
        partyId: party.id
      })

      return this.app.service('party')._get(party.id)
    } catch (err) {
      logger.error(err)
      throw err
    }
  }

  async patch(id: Id, data: PartyPatch, params?: PartyParams) {
    return super._patch(id, data, params)
  }

  async remove(id: Id, params?: PartyParams) {
    const partyUsers = (
      await this.app.service('party-user').find({
        query: {
          partyId: id
        }
      })
    ).data
    if (!params!.skipPartyUserDelete)
      await Promise.all(
        partyUsers.map(async (partyUser) =>
          this.app.service('party-user')._remove(partyUser.id, { deletingParty: true })
        )
      )
    const removedParty = (await super._remove(id)) as T
    ;(removedParty as any).party_users = partyUsers
    await this.app.service('invite')._remove(null!, {
      query: {
        inviteType: 'party',
        targetObjectId: id
      }
    })
    return removedParty
  }
}
