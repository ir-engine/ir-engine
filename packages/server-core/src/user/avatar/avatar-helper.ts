import { Params } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import { AvatarProps } from '@xrengine/common/src/interfaces/AvatarInterface'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
// import { generateAvatarThumbnail } from './generateAvatarThumbnail'
import { CommonKnownContentTypes } from '@xrengine/common/src/utils/CommonKnownContentTypes'
import fs from 'fs'
import path from 'path'
import { addGenericAssetToS3AndStaticResources } from '../../media/upload-media/upload-asset.service'

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

  const name = data.avatarName ?? 'Avatar-' + Math.round(Math.random() * 10000)

  const modelPromise = addGenericAssetToS3AndStaticResources(app, data.avatar, {
    userId: data.userId!,
    key: `${key}.glb`,
    staticResourceType: 'avatar',
    contentType: CommonKnownContentTypes.glb,
    name
  })

  const thumbnailPromise = addGenericAssetToS3AndStaticResources(app, data.thumbnail, {
    userId: data.userId!,
    key: `${key}.png`,
    staticResourceType: 'user-thumbnail',
    contentType: CommonKnownContentTypes.png,
    name
  })

  const [avatarURL, thumbnailURL] = await Promise.all([modelPromise, thumbnailPromise])

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
