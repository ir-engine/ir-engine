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

import { userRelationshipPath } from '@etherealengine/engine/src/schemas/user/user-relationship.schema'
import { UserType, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Id, Paginated, Query } from '@feathersjs/feathers'
import crypto from 'crypto'
import { Application } from '../../../declarations'
import { sendInvite } from '../../hooks/send-invite'

import { Params } from '@feathersjs/feathers'
import type { KnexAdapterOptions } from '@feathersjs/knex'
import { KnexAdapter } from '@feathersjs/knex'

import {
  InviteData,
  InvitePatch,
  InviteQuery,
  InviteType,
  invitePath
} from '@etherealengine/engine/src/schemas/social/invite.schema'
import {
  IdentityProviderType,
  identityProviderPath
} from '@etherealengine/engine/src/schemas/user/identity-provider.schema'
import { Forbidden } from '@feathersjs/errors'
import { KnexAdapterParams } from '@feathersjs/knex'
import logger from '../../ServerLogger'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InviteParams extends KnexAdapterParams<InviteQuery> {
  preventUserRelationshipRemoval?: boolean
}

const afterInviteFind = async (app: Application, result: Paginated<InviteType>) => {
  try {
    await Promise.all(
      result.data.map(async (item) => {
        return await new Promise(async (resolve) => {
          if (item.inviteeId != null) {
            item.invitee = await app.service(userPath).get(item.inviteeId)
          } else if (item.token) {
            const identityProvider = (await app.service(identityProviderPath).find({
              query: {
                token: item.token
              }
            })) as Paginated<IdentityProviderType>
            if (identityProvider.data.length > 0) {
              item.invitee = await app.service(userPath).get(identityProvider.data[0].userId)
            }
          }
          item.user = await app.service(userPath).get(item.userId)

          resolve(true)
        })
      })
    )
  } catch (err) {
    logger.error(err, `INVITE AFTER HOOK ERROR: ${err.message}`)
    return null!
  }
}

export const inviteReceived = async (app: Application, query) => {
  const identityProviders = (await app.service(identityProviderPath).find({
    query: {
      userId: query.userId
    }
  })) as Paginated<IdentityProviderType>
  const identityProviderTokens = identityProviders.data.map((provider) => provider.token)

  const { search } = query

  if (search) {
    query = {
      ...query,
      $or: [
        {
          inviteType: {
            $like: '%' + search + '%'
          }
        },
        {
          passcode: {
            $like: '%' + search + '%'
          }
        }
      ]
    }
  }

  delete query.type
  delete query.search
  return (await app.service(invitePath)._find({
    query: {
      ...query,
      $or: [
        {
          inviteeId: query.userId
        },
        {
          token: {
            $in: identityProviderTokens
          }
        }
      ]
    }
  })) as Paginated<InviteType>
}

export const inviteSent = async (app: Application, query: Query) => {
  const { search } = query

  if (search) {
    query = {
      ...query,
      $or: [
        {
          inviteType: {
            $like: '%' + search + '%'
          }
        },
        {
          passcode: {
            $like: '%' + search + '%'
          }
        }
      ]
    }
  }

  delete query.type
  delete query.search
  return (await app.service(invitePath)._find({
    query: {
      ...query,
      userId: query.userId
    }
  })) as Paginated<InviteType>
}

export const inviteAll = async (app: Application, query: Query, user: UserType) => {
  if ((!user || !user.scopes || !user.scopes.find((scope) => scope.type === 'admin:admin')) && !query.existenceCheck)
    throw new Forbidden('Must be admin to search invites in this way')

  const { search } = query

  if (search) {
    query = {
      ...query,
      $or: [
        {
          inviteType: {
            $like: '%' + search + '%'
          }
        },
        {
          passcode: {
            $like: '%' + search + '%'
          }
        }
      ]
    }
  }
  if (!query.existenceCheck) delete query.userId
  delete query.existenceCheck
  delete query.search
  return (await app.service(invitePath)._find({
    query: {
      // userId: query.userId,
      ...query
    }
  })) as Paginated<InviteType>
}

/**
 * A class for Invite service
 */

export class InviteService<T = InviteType, ServiceParams extends Params = InviteParams> extends KnexAdapter<
  InviteType,
  InviteData,
  InviteParams,
  InvitePatch
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: Id, params?: Params): Promise<any> {
    return super._get(id, params)
  }

  async create(data: InviteData, params?: InviteParams) {
    const user = params!.user!
    if (!user.scopes?.find((scope) => scope.type === 'admin:admin')) delete data.makeAdmin
    data.passcode = crypto.randomBytes(8).toString('hex')
    const result = await super._create(data)
    await sendInvite(this.app, result, params!)
    return result
  }

  /**
   * A method which get all invite
   *
   * @param params of query with type and userId
   * @returns invite data
   */
  async find(params?: InviteParams) {
    let result: Paginated<InviteType> = null!
    if (params && params.query) {
      const query = params.query
      if (query.type === 'received') {
        result = await inviteReceived(this.app, query)
      } else if (query.type === 'sent') {
        result = await inviteSent(this.app, query)
      } else {
        result = await inviteAll(this.app, query, params.user!)
      }
    } else {
      result = (await super._find(params)) as Paginated<InviteType>
    }
    await afterInviteFind(this.app, result)
    return result
  }

  async remove(id: Id, params?: InviteParams) {
    console.log('invite remove')
    if (!id) return super._remove(id, params)
    const invite = await super._get(id)
    if (invite.inviteType === 'friend' && invite.inviteeId != null && !params?.preventUserRelationshipRemoval) {
      const selfUser = params!.user as UserType
      const relatedUserId = invite.userId === selfUser.id ? invite.inviteeId : invite.userId
      await this.app.service(userRelationshipPath).remove(relatedUserId, params as any)
    }
    return await super._remove(id)
  }

  async patch(id: Id, data: InvitePatch, params?: InviteParams) {
    return await super._patch(id, data, params)
  }
}
