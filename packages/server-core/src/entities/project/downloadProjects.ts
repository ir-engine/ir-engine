import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { getFileKeysRecursive } from '../../media/storageprovider/storageProviderUtils'
// import { ProjectManifestInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import fs from 'fs'
import path from 'path'
import { deleteFolderRecursive, writeFileSyncRecursive } from '../../util/fsHelperFunctions'
import appRootPath from 'app-root-path'

const storageProvider = useStorageProvider()

export const download = async (packName) => {
  try {
    console.log('downloading pack with pack name', packName)
    const files = await getFileKeysRecursive(`projects/${packName}`)
    console.log(files)
    console.log('[ProjectLoader]: Installing project', packName, '...')

    const localProjectDirectory = path.resolve(appRootPath.path, 'packages/projects/projects', packName)
    if (fs.existsSync(localProjectDirectory)) {
      console.log('[Project temp debug]: fs exists, deleting')
      deleteFolderRecursive(localProjectDirectory)
    }

    for (const filePath of files) {
      console.log(`[ProjectLoader]: - downloading "${filePath}"`)
      const fileResult = await storageProvider.getObject(filePath)
      console.log(path.resolve(appRootPath.path, 'packages/projects'))
      writeFileSyncRecursive(path.resolve(appRootPath.path, 'packages/projects', filePath), fileResult.Body.toString()) //, 'utf8')
    }

    console.log('[ProjectLoader]: Successfully downloaded and mounted project', packName)
  } catch (e) {
    console.log(`[ProjectLoader]: Failed to download project with error ${e}`)
    return false
  }

  return true
}
