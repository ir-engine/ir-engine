import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import logger from '../../logger'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { getFileKeysRecursive } from '../../media/storageprovider/storageProviderUtils'
import { deleteFolderRecursive, writeFileSyncRecursive } from '../../util/fsHelperFunctions'

const storageProvider = useStorageProvider()

export const download = async (projectName) => {
  try {
    logger.info(`[ProjectLoader]: Installing project "${projectName}"...`)
    const files = await getFileKeysRecursive(`projects/${projectName}/`)
    logger.info('[ProjectLoader]: Found files:' + files)

    const localProjectDirectory = path.join(appRootPath.path, 'packages/projects/projects', projectName)
    if (fs.existsSync(localProjectDirectory)) {
      logger.info('[Project temp debug]: fs exists, deleting')
      deleteFolderRecursive(localProjectDirectory)
    }

    await Promise.all(
      files.map(async (filePath) => {
        logger.info(`[ProjectLoader]: - downloading "${filePath}"`)
        const fileResult = await storageProvider.getObject(filePath)

        if (fileResult.Body.length === 0) {
          logger.info(`[ProjectLoader]: WARNING file "${filePath}" is empty`)
        }
        writeFileSyncRecursive(path.join(appRootPath.path, 'packages/projects', filePath), fileResult.Body)
      })
    )

    logger.info(`[ProjectLoader]: Successfully downloaded and mounted project "${projectName}".`)
  } catch (e) {
    logger.error(e, `[ProjectLoader]: Failed to download project with error: ${e.message}`)
    return false
  }

  return true
}
