import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'

import { Application } from '../../../declarations'
import logger from '../../logger'
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

  async find(params?: Params): Promise<AvatarInterface[] | Paginated<AvatarInterface>> {
    const self = this
    if (params?.query?.search != null) {
      if (params.query.search.length > 0)
        params.query.name = {
          [Op.like]: `%${params.query.search}%`
        }
      delete params.query.search
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

  async create(data: AvatarCreateArguments, params?: Params): Promise<AvatarInterface> {
    let avatar = (await super.create({
      name: data.name,
      modelResourceId: data.modelResourceId,
      thumbnailResourceId: data.thumbnailResourceId
    })) as AvatarInterface
    avatar = await this.patch(avatar.id, {
      identifierName: avatar.name + '_' + avatar.id
    })
    return avatar
  }

  async patch(id: string, data: AvatarPatchArguments, params?: Params): Promise<AvatarInterface> {
    let avatar = (await super.patch(id, data, params)) as AvatarInterface
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
    } catch (err) {}
    try {
      await this.app.service('static-resource').remove(avatar.thumbnailResourceId)
    } catch (err) {}
    return super.remove(id, params) as Promise<AvatarInterface>
  }
}
