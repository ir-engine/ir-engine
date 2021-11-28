import { Params } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import { AvatarProps } from '@xrengine/common/src/interfaces/AvatarInterface'
import { AssetUploadArguments } from '@xrengine/common/src/interfaces/UploadAssetInterface'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { getCachedAsset } from '../../media/storageprovider/getCachedAsset'
import { generateAvatarThumbnail } from './generateAvatarThumbnail'
import { CommonKnownContentTypes } from '@xrengine/common/src/utils/CommonKnownContentTypes'

const provider = useStorageProvider()

export const uploadAvatarStaticResource = async (
  app: Application,
  data: AssetUploadArguments & { userId: string },
  params?: Params
) => {
  const key = `avatars/${data.userId}/${data.avatarName}`
  // make userId optional and safe for feathers create
  const userIdQuery = data.userId ? { userId: data.userId } : {}

  const thumbnail = await generateAvatarThumbnail(data.avatar as Buffer)

  await provider.putObject({
    Key: `${key}.glb`,
    Body: data.avatar as Buffer,
    ContentType: CommonKnownContentTypes.glb
  })
  await app.service('static-resource').create(
    {
      name: data.avatarName,
      mimeType: CommonKnownContentTypes.glb,
      url: getCachedAsset(`${key}.glb`, provider.cacheDomain),
      key: `${key}.glb`,
      staticResourceType: 'avatar',
      ...userIdQuery
    },
    null!
  )
  await provider.putObject({
    Key: `${key}.png`,
    Body: thumbnail,
    ContentType: CommonKnownContentTypes.png
  })
  await app.service('static-resource').create(
    {
      name: data.avatarName,
      mimeType: CommonKnownContentTypes.png,
      url: getCachedAsset(`${key}.png`, provider.cacheDomain),
      key: `${key}.png`,
      staticResourceType: 'user-thumbnail',
      ...userIdQuery
    },
    null!
  )

  // const existingModel = await app.service('static-resource').find({
  //   query: {
  //     name: name,
  //     staticResourceType: 'avatar',
  //     ...userIdQuery
  //   }
  // })
  // const existingThumbnail = await app.service('static-resource').find({
  //   query: {
  //     name: name,
  //     staticResourceType: 'user-thumbnail',
  //     ...userIdQuery
  //   }
  // })
  // existingModel.total > 0
  //   ? app.service('static-resource').patch(existingModel.data[0].id, {
  //       url: modelUrl,
  //       key: modelURL.fields.Key
  //     })
  //   : app.service('static-resource').create(
  //       {
  //         name,
  //         staticResourceType: 'avatar',
  //         url: modelUrl,
  //         key: modelURL.fields.Key,
  //         ...userIdQuery
  //       },
  //       null!
  //     )
  // existingThumbnail.total > 0
  //   ? client.service('static-resource').patch(existingThumbnail.data[0].id, {
  //       url: thumbnailUrl,
  //       key: thumbnailURL.fields.Key
  //     })
  //   : client.service('static-resource').create({
  //       name,
  //       staticResourceType: 'user-thumbnail',
  //       url: thumbnailUrl,
  //       mimeType: 'image/png',
  //       key: thumbnailURL.fields.Key,
  //       userId: isPublicAvatar ? null : selfUser.id.value
  //     })
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
