import { ProjectEventHooks } from '@xrengine/projects/ProjectConfigInterface'
import { Application } from '@xrengine/server-core/declarations'
import fs from 'fs'
import path from 'path'
import { addAvatarToDatabase } from '@xrengine/server-core/src/util/avatarHelperFunctions'
import { getCachedAsset } from '@xrengine/server-core/src/media/storageprovider/getCachedAsset'
import { useStorageProvider } from '@xrengine/server-core/src/media/storageprovider/storageprovider'

const avatarsFolder = path.resolve('./avatars')

const config = {
  onInstall: async (app: Application) => {
    const storageProvider = useStorageProvider()
    const avatarsToInstall = fs
      .readdirSync(avatarsFolder, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
    for (const avatarName of avatarsToInstall) {
      const avatarUrl = getCachedAsset(avatarName, storageProvider.cacheDomain)
      addAvatarToDatabase(avatarName, avatarUrl, null!)
    }
    console.log('onInstall hook called')
  },
  onUpdate: async (app: Application) => {
    console.log('onUpdate hook called')
  },
  onUninstall: async (app: Application) => {
    console.log('onUninstall hook called')
  }
} as ProjectEventHooks

export default config
