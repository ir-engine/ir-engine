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

import { AvatarInterface } from '@etherealengine/common/src/interfaces/AvatarInterface'

import { Application } from '../../../declarations'
import { checkScope } from '../../hooks/verify-scope'
import logger from '../../ServerLogger'
import { UnauthorizedException } from '../../util/exceptions/exception'
import { UserParams } from '../user/user.class'
import { AvatarCreateArguments, AvatarPatchArguments } from './avatar-helper'

export class Avatar extends Service<AvatarInterface> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: string, params?: Params): Promise<AvatarInterface> {
    const avatar = await super.get(id, params)
    if (avatar.modelResourceId)
      try {
        avatar.modelResource = await this.app.service('static-resource').get(avatar.modelResourceId)
      } catch (err) {
        logger.error(err)
      }
    if (avatar.thumbnailResourceId)
      try {
        avatar.thumbnailResource = await this.app.service('static-resource').get(avatar.thumbnailResourceId)
      } catch (err) {
        logger.error(err)
      }
    return avatar
  }

  async find(
    params?: UserParams & { query?: { admin?: boolean } }
  ): Promise<AvatarInterface[] | Paginated<AvatarInterface>> {
    let isAdmin = false
    if (params && params.user && params.user.id && params.query?.admin) {
      // todo do we want to use globalAvatars:read/write intead here?
      isAdmin = await checkScope(params?.user, this.app, 'admin', 'admin')
      delete params.query.admin
    }

    if (params?.query?.search != null) {
      if (params.query.search.length > 0)
        params.query.name = {
          [Op.like]: `%${params.query.search}%`
        }
    }
    if (params?.query) delete params.query.search

    if (!isAdmin && params) {
      if (params.user && params.user.id) {
        params.query = {
          ...params?.query,
          [Op.or]: [
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

    const avatars = (await super.find(params)) as Paginated<AvatarInterface>
    await Promise.all(
      avatars.data.map(async (avatar) => {
        if (avatar.modelResourceId)
          try {
            avatar.modelResource = await this.app.service('static-resource').get(avatar.modelResourceId)
          } catch (err) {}
        if (avatar.thumbnailResourceId)
          try {
            avatar.thumbnailResource = await this.app.service('static-resource').get(avatar.thumbnailResourceId)
          } catch (err) {}
        return avatar
      })
    )
    return avatars
  }

  async create(data: AvatarCreateArguments, params?: UserParams): Promise<AvatarInterface> {
    let avatar = (await super.create({
      name: data.name,
      isPublic: data.isPublic ?? true,
      userId: params?.user!.id,
      modelResourceId: data.modelResourceId,
      thumbnailResourceId: data.thumbnailResourceId,
      project: data.project
    })) as AvatarInterface
    avatar = await this.patch(avatar.id, {
      identifierName: avatar.name + '_' + avatar.id
    })
    return avatar
  }

  async patch(id: string, data: AvatarPatchArguments, params?: UserParams): Promise<AvatarInterface> {
    let avatar = (await super.get(id, params)) as AvatarInterface

    if (avatar.userId !== params?.user!.id && params && params.user && params.user.id) {
      const hasPermission = await checkScope(params?.user, this.app, 'admin', 'admin')
      if (!hasPermission) {
        throw new UnauthorizedException(`Unauthorized to perform this action.`)
      }
    }

    avatar = (await super.patch(id, data, params)) as AvatarInterface
    avatar = (await super.patch(avatar.id, {
      identifierName: avatar.name + '_' + avatar.id
    })) as AvatarInterface

    if (avatar.modelResourceId)
      try {
        avatar.modelResource = await this.app.service('static-resource').get(avatar.modelResourceId)
      } catch (err) {}
    if (avatar.thumbnailResourceId)
      try {
        avatar.thumbnailResource = await this.app.service('static-resource').get(avatar.thumbnailResourceId)
      } catch (err) {}
    return avatar
  }

  async remove(id: string, params?: Params): Promise<AvatarInterface> {
    const avatar = await this.get(id, params)
    try {
      await this.app.service('static-resource').remove(avatar.modelResourceId)
    } catch (err) {
      logger.error(err)
    }
    try {
      await this.app.service('static-resource').remove(avatar.thumbnailResourceId)
    } catch (err) {}
    const avatars = (await super.Model.findAll({
      where: {
        id: {
          [Op.ne]: id
        }
      }
    })) as AvatarInterface[]
    //Users that have the avatar that's being deleted will have theirs replaced with a random one, if there are other
    //avatars to use
    if (id && avatars.length > 0) {
      const randomReplacementAvatar = avatars[Math.floor(Math.random() * avatars.length)]
      await this.app.service('user').Model.update(
        {
          avatarId: randomReplacementAvatar.id
        },
        {
          where: {
            avatarId: id
          }
        }
      )
    }
    return super.remove(id, params) as Promise<AvatarInterface>
  }
}
