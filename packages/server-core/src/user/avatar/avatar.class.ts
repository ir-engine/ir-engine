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
import { KnexAdapter, type KnexAdapterOptions } from '@feathersjs/knex'

import { staticResourcePath } from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import {
  AvatarData,
  AvatarDatabaseType,
  AvatarPatch,
  AvatarQuery,
  AvatarType
} from '@etherealengine/engine/src/schemas/user/avatar.schema'

import { checkScope } from '@etherealengine/engine/src/common/functions/checkScope'
import { userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { RootParams } from '../../api/root-params'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AvatarParams extends RootParams<AvatarQuery> {}

/**
 * A class for Avatar service
 */

export class AvatarService<T = AvatarType, ServiceParams extends Params = AvatarParams> extends KnexAdapter<
  AvatarType,
  AvatarData,
  AvatarParams,
  AvatarPatch
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: Id, params?: AvatarParams) {
    return super._get(id, params)
  }

  async find(params?: AvatarParams) {
    let isAdmin = false

    if (params && params.user && params.user.id && params.query?.admin) {
      // TODO: Do we want to use globalAvatars:read/write instead here?
      isAdmin = await checkScope(params?.user, 'admin', 'admin')
      delete params.query.admin
    }

    if (params?.query?.search) {
      params.query.name = {
        $like: `%${params.query.search}%`
      }
    }

    if (params?.query) delete params.query.search

    if (!isAdmin && params) {
      if (params.user && params.user.id) {
        params.query = {
          ...params?.query,
          $or: [
            {
              isPublic: true
            },
            {
              isPublic: false,
              userId: params.user.id
            }
          ]
        }
      } else {
        params.query = {
          ...params?.query,
          isPublic: true
        }
      }
    }

    return await super._find(params)
  }

  async create(data: AvatarData, params?: AvatarParams) {
    let avatar = await super._create({
      ...data,
      isPublic: data.isPublic ?? true,
      userId: params?.user?.id
    })

    avatar = await super._patch(avatar.id, {
      identifierName: avatar.name + '_' + avatar.id
    })

    return avatar
  }

  async patch(id: Id, data: AvatarPatch, params?: AvatarParams) {
    return await super._patch(id, data, params)
  }

  async remove(id: string, params?: AvatarParams) {
    const avatar = await this.get(id, params)

    try {
      await this.app.service(staticResourcePath).remove(avatar.modelResourceId)
    } catch (err) {
      logger.error(err)
    }

    try {
      await this.app.service(staticResourcePath).remove(avatar.thumbnailResourceId)
    } catch (err) {
      logger.error(err)
    }

    const avatars = (await super._find({
      query: {
        id: {
          $ne: id
        }
      },
      paginate: false
    })) as any as AvatarDatabaseType[]

    //Users that have the avatar that's being deleted will have theirs replaced with a random one, if there are other
    //avatars to use
    if (id && avatars.length > 0) {
      const randomReplacementAvatar = avatars[Math.floor(Math.random() * avatars.length)]
      await this.app.service(userPath)._patch(
        null,
        {
          avatarId: randomReplacementAvatar.id
        },
        {
          query: {
            avatarId: id
          }
        }
      )
    }

    return super._remove(id, params)
  }
}
