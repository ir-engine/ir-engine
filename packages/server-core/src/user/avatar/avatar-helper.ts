import { Params } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import { AvatarProps } from '@xrengine/common/src/interfaces/AvatarInterface'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { getCachedAsset } from '../../media/storageprovider/getCachedAsset'
// import { generateAvatarThumbnail } from './generateAvatarThumbnail'
import { CommonKnownContentTypes } from '@xrengine/common/src/utils/CommonKnownContentTypes'
import fs from 'fs'
import path from 'path'

const provider = useStorageProvider()

export type AvatarUploadArguments = {
  avatar: Buffer
  thumbnail: Buffer
  avatarName: string
  isPublicAvatar?: boolean
  userId?: string
}

export const installAvatarsFromProject = async (app: Application, avatarsFolder: string) => {
  const avatarsToInstall = fs
    .readdirSync(avatarsFolder, { withFileTypes: true })
    .filter((dirent) => dirent.name.split('.').pop() === 'glb')
    .map((dirent) => {
      const avatarName = dirent.name.replace(/\..+$/, '') // remove extension
      const thumbnail = fs.existsSync(path.join(avatarsFolder, avatarName + '.png'))
        ? fs.readFileSync(path.join(avatarsFolder, avatarName + '.png'))
        : Buffer.from([])
      return {
        avatar: fs.readFileSync(path.join(avatarsFolder, dirent.name)),
        thumbnail,
        avatarName,
        isPublicAvatar: true
      }
    })
  const promises: Promise<any>[] = []
  for (const avatar of avatarsToInstall) {
    promises.push(uploadAvatarStaticResource(app, avatar))
  }
  await Promise.all(promises)
}

export const uploadAvatarStaticResource = async (app: Application, data: AvatarUploadArguments, params?: Params) => {
  const key = `avatars/${data.userId ?? 'public'}/${data.avatarName}`

  // const thumbnail = await generateAvatarThumbnail(data.avatar as Buffer)
  // if (!thumbnail) throw new Error('Thumbnail generation failed - check the model')

  // make userId optional and safe for feathers create
  const userIdQuery = data.userId ? { userId: data.userId } : {}
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
      app.service('static-resource').patch(
        existingModel.data[0].id,
        {
          url: avatarURL,
          key: `${key}.glb`
        },
        { isInternal: true }
      )
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
        { isInternal: true }
      )
    )
  }

  // upload thumbnail to storage provider
  promises.push(
    provider.putObject({
      Key: `${key}.png`,
      Body: data.thumbnail as Buffer,
      ContentType: CommonKnownContentTypes.png
    })
  )

  // add thumbnail to static resources
  const thumbnailURL = getCachedAsset(`${key}.png`, provider.cacheDomain)
  if (existingThumbnail.data.length) {
    promises.push(provider.deleteResources([existingThumbnail.data[0].id]))
    promises.push(
      app.service('static-resource').patch(
        existingThumbnail.data[0].id,
        {
          url: thumbnailURL,
          key: `${key}.png`
        },
        { isInternal: true }
      )
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
        { isInternal: true }
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
    },
    isInternal: true
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
