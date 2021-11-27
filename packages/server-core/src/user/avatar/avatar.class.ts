import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Params } from '@feathersjs/feathers'
import { AvatarProps } from '@xrengine/common/src/interfaces/AvatarInterface'

type AvatarUserProps = {
  userId: string
}

export const addAvatarToDatabase = async (
  app: Application,
  userId: string,
  name: string,
  modelUrl: string,
  thumbnailUrl: string
) => {
  const userIdQuery = userId ? { userId } : {}
  const existingModel = await app.service('static-resource').find({
    query: {
      name: name,
      staticResourceType: 'avatar',
      ...userIdQuery
    }
  })
  const existingThumbnail = await app.service('static-resource').find({
    query: {
      name: name,
      staticResourceType: 'user-thumbnail',
      ...userIdQuery
    }
  })
  existingModel.total > 0
    ? app.service('static-resource').patch(existingModel.data[0].id, {
        url: modelUrl,
        key: modelURL.fields.Key
      })
    : app.service('static-resource').create(
        {
          name,
          staticResourceType: 'avatar',
          url: modelUrl,
          key: modelURL.fields.Key,
          ...userIdQuery
        },
        null!
      )
  existingThumbnail.total > 0
    ? client.service('static-resource').patch(existingThumbnail.data[0].id, {
        url: thumbnailUrl,
        key: thumbnailURL.fields.Key
      })
    : client.service('static-resource').create({
        name,
        staticResourceType: 'user-thumbnail',
        url: thumbnailUrl,
        mimeType: 'image/png',
        key: thumbnailURL.fields.Key,
        userId: isPublicAvatar ? null : selfUser.id.value
      })
}

export const removeAvatarFromDatabase = async (app: Application, name: string) => {}

export const getAvatarFromStaticResources = async (app: Application, name?: string) => {
  const nameQuery = name ? { name } : {}
  const avatarQueryResult = await app.service('static-resource').find({
    paginate: false,
    query: {
      $select: ['id', 'name', 'url', 'staticResourceType'],
      ...nameQuery,
      staticResourceType: {
        $in: ['user-thumbnail', 'avatar']
      }
    }
  })
  const avatars = avatarQueryResult.reduce((acc, curr) => {
    const val = acc[curr.name]
    const key = curr.staticResourceType === 'avatar' ? 'avatarURL' : 'thumbnailURL'
    return {
      ...acc,
      [curr.name]: {
        ...val,
        avatarId: curr.name,
        [key]: curr.url
      }
    }
  }, {})
  return Object.values(avatars) as AvatarProps[]
}

/**
 * This class used to find user
 * and returns founded users
 */
export class Avatar extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async get(name: string, params: Params): Promise<any> {
    return (await getAvatarFromStaticResources(this.app, name))[0]
  }

  async find(params: Params): Promise<any> {
    return await getAvatarFromStaticResources(this.app)
  }

  async create(data: AvatarProps & AvatarUserProps, params: Params): Promise<any> {
    await addAvatarToDatabase(this.app, data.userId, data.avatarId, data.avatarURL, data.thumbnailURL!)
  }
}
