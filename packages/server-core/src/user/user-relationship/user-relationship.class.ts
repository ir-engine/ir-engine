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

import { UserID, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'

import { Application } from '../../../declarations'
import config from '../../appconfig'

import type { KnexAdapterOptions } from '@feathersjs/knex'
import { KnexAdapter } from '@feathersjs/knex'

import {
  UserRelationshipData,
  UserRelationshipID,
  UserRelationshipPatch,
  UserRelationshipQuery,
  UserRelationshipType,
  userRelationshipPath
} from '@etherealengine/engine/src/schemas/user/user-relationship.schema'
import { Knex } from 'knex'
import { v4 } from 'uuid'
import { RootParams } from '../../api/root-params'
import { getDateTimeSql } from '../../util/datetime-sql'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserRelationshipParams extends RootParams<UserRelationshipQuery> {}

/**
 * A class for User Relationship service
 */
export class UserRelationshipService<
  T = UserRelationshipType,
  ServiceParams extends Params = UserRelationshipParams
> extends KnexAdapter<UserRelationshipType, UserRelationshipData, UserRelationshipParams, UserRelationshipPatch> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: UserRelationshipParams) {
    if (!params) params = {}

    const loggedInUserId = params.user?.id

    if (!loggedInUserId) {
      throw new Error('User must be logged in to get relationships')
    }

    // Override the user id to be currently logged in user. This is to avoid user finding other user's relationships due to security concerns.
    params.query = {
      ...params.query,
      userId: loggedInUserId
    }

    return await super._find(params)
  }

  async create(data: UserRelationshipData, params?: UserRelationshipParams) {
    if (!params) params = {}

    const loggedInUserEntity = config.authentication.entity

    const userId = data.userId || params[loggedInUserEntity].userId
    const { relatedUserId, userRelationshipType } = data

    if (userRelationshipType === 'blocking') {
      await super._remove(null, {
        query: {
          $or: [
            {
              relatedUserId,
              userId
            },
            {
              relatedUserId: userId,
              userId: relatedUserId
            }
          ]
        }
      })
    }

    const trx = await (this.app.get('knexClient') as Knex).transaction()

    await trx.from<UserRelationshipType>(userRelationshipPath).insert({
      id: v4() as UserRelationshipID,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql(),
      userId: userId,
      relatedUserId: relatedUserId,
      userRelationshipType: userRelationshipType
    })

    if (userRelationshipType === 'blocking' || userRelationshipType === 'requested') {
      await trx.from<UserRelationshipType>(userRelationshipPath).insert({
        id: v4() as UserRelationshipID,
        createdAt: await getDateTimeSql(),
        updatedAt: await getDateTimeSql(),
        userId: relatedUserId,
        relatedUserId: userId,
        userRelationshipType: userRelationshipType === 'blocking' ? 'blocked' : 'pending'
      })
    }

    await trx.commit()

    const result = await super._find({
      query: {
        userId,
        relatedUserId
      }
    })

    return result.data.length > 0 ? result.data[0] : undefined
  }

  async patch(id: Id, data: UserRelationshipPatch, params?: UserRelationshipParams) {
    if (!params) params = {}

    const { userRelationshipType } = data

    let queryParams: UserRelationshipPatch

    try {
      await this.app.service(userPath).get(id)
      //The ID resolves to a userId, in which case patch the relation joining that user to the requesting one
      queryParams = {
        userId: params.user!.id,
        relatedUserId: id as UserID
      }
    } catch (err) {
      //The ID does not resolve to a user, in which case it's the ID of the user-relationship object, so patch it
      queryParams = {
        id: id as UserRelationshipID
      }
    }

    const trx = await (this.app.get('knexClient') as Knex).transaction()

    await trx
      .from<UserRelationshipType>(userRelationshipPath)
      .update({
        userRelationshipType: userRelationshipType
      })
      .where(queryParams)

    if (userRelationshipType === 'friend' || userRelationshipType === 'blocking') {
      const result = await super._find({
        query: queryParams
      })

      if (result.data.length > 0) {
        await trx
          .from<UserRelationshipType>(userRelationshipPath)
          .update({
            userRelationshipType: userRelationshipType === 'friend' ? 'friend' : 'blocked'
          })
          .where({
            userId: result.data[0].relatedUserId,
            relatedUserId: result.data[0].userId
          })
      }
    }

    await trx.commit()

    const response = await super._find({
      query: queryParams
    })

    return response.data.length > 0 ? response.data[0] : undefined
  }

  async remove(id: UserID, params?: UserRelationshipParams) {
    if (!params) params = {}

    const loggedInUserEntity = config.authentication.entity

    const authUser = params[loggedInUserEntity]
    const userId = authUser.userId

    //If the ID provided is not a user ID, as it's expected to be, it'll throw a 404
    await this.app.service(userPath).get(id)

    return await super._remove(null, {
      query: {
        $or: [
          {
            userId,
            relatedUserId: id
          },
          {
            userId: id,
            relatedUserId: userId
          }
        ]
      }
    })
  }
}
