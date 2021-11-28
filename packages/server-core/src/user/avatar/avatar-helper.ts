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
  data: AssetUploadArguments & { userId?: string },
  params?: Params
) => {
  const key = `avatars/${data.userId ?? 'public'}/${data.avatarName}`

  const thumbnail = await generateAvatarThumbnail(data.avatar as Buffer)

  if (!thumbnail) throw new Error('Thumbnail generation failed - check the model')

  // make userId optional and safe for feathers create
  const userIdQuery = data.userId ? { userId: data.userId } : {}
  console.log(data)
  const name = data.avatarName ?? 'Avatar-' + Math.round(Math.random() * 10000)

  const [existingModel, existingThumbnail] = await Promise.all([
    app.service('static-resource').find({
      query: {
        name,
        staticResourceType: 'avatar',
        ...userIdQuery
      }
    }),
    app.service('static-resource').find({
      query: {
        name,
        staticResourceType: 'user-thumbnail',
        ...userIdQuery
      }
    })
  ])

  console.log(existingModel, existingThumbnail)

  const promises: Promise<any>[] = []

  // upload model to storage provider
  promises.push(
    provider.putObject({
      Key: `${key}.glb`,
      Body: data.avatar as Buffer,
      ContentType: CommonKnownContentTypes.glb
    })
  )

  // add model to static resources
  const avatarURL = getCachedAsset(`${key}.glb`, provider.cacheDomain)
  if (existingModel.data.length) {
    promises.push(provider.deleteResources([existingModel.data[0].id]))
    promises.push(
      app.service('static-resource').patch(existingModel.data[0].id, {
        url: avatarURL,
        key: `${key}.glb`
      })
    )
  } else {
    promises.push(
      app.service('static-resource').create(
        {
          name: data.avatarName,
          mimeType: CommonKnownContentTypes.glb,
          url: avatarURL,
          key: `${key}.glb`,
          staticResourceType: 'avatar',
          ...userIdQuery
        },
        null!
      )
    )
  }

  // upload thumbnail to storage provider
  promises.push(
    provider.putObject({
      Key: `${key}.png`,
      Body: thumbnail,
      ContentType: CommonKnownContentTypes.png
    })
  )

  // add thumbnail to static resources
  const thumbnailURL = getCachedAsset(`${key}.png`, provider.cacheDomain)
  if (existingThumbnail.data.length) {
    promises.push(provider.deleteResources([existingThumbnail.data[0].id]))
    promises.push(
      app.service('static-resource').patch(existingThumbnail.data[0].id, {
        url: thumbnailURL,
        key: `${key}.png`
      })
    )
  } else {
    promises.push(
      app.service('static-resource').create(
        {
          name: data.avatarName,
          mimeType: CommonKnownContentTypes.png,
          url: thumbnailURL,
          key: `${key}.png`,
          staticResourceType: 'user-thumbnail',
          ...userIdQuery
        },
        null!
      )
    )
  }

  await Promise.all(promises)

  console.log('Successfully uploaded avatar!', avatarURL)

  return {
    avatarURL,
    thumbnailURL
  }
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
