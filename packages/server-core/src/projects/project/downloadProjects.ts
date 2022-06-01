import appRootPath from 'app-root-path'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

import logger from '../../logger'
import { getCachedAsset } from '../../media/storageprovider/getCachedAsset'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { getFileKeysRecursive } from '../../media/storageprovider/storageProviderUtils'
import { deleteFolderRecursive, writeFileSyncRecursive } from '../../util/fsHelperFunctions'

/**
 * Downloads a specific project to the local file system from the storage provider cache
 * Then runs `npm install --legacy-peer-deps` inside the project to install it's dependencies
 * @param projectName
 * @returns {Promise<boolean>}
 */
export const download = async (projectName: string) => {
  const storageProvider = getStorageProvider()
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
        if (path.parse(filePath).ext.length > 0) {
          logger.info(`[ProjectLoader]: - downloading "${filePath}"`)
          const fileResult = await await (
            await fetch(getCachedAsset(filePath, storageProvider.cacheDomain, true))
          ).arrayBuffer()
          if (fileResult.byteLength === 0) logger.info(`[ProjectLoader]: WARNING file "${filePath}" is empty`)
          writeFileSyncRecursive(path.join(appRootPath.path, 'packages/projects', filePath), fileResult)
        }
      })
    )

    logger.info(`[ProjectLoader]: Successfully downloaded and mounted project "${projectName}".`)
    if (projectName !== 'default-project') {
      const npmInstallPromise = new Promise((resolve) => {
        const npmInstallProcess = spawn('npm', ['install', '--legacy-peer-deps'], { cwd: localProjectDirectory })
        npmInstallProcess.once('exit', resolve)
        npmInstallProcess.once('error', resolve)
        npmInstallProcess.once('disconnect', resolve)
        npmInstallProcess.stdout.on('data', (data) => logger.info(data.toString()))
      }).then((result) => logger.info(result))
      await Promise.race([
        npmInstallPromise,
        new Promise<void>((resolve) => {
          setTimeout(() => {
            logger.warn(`WARNING: npm installing ${projectName} too long!`)
            resolve()
          }, 20 * 60 * 1000) // timeout after 10 minutes
        })
      ])
    }
  } catch (e) {
    logger.error(e, `[ProjectLoader]: Failed to download project with error: ${e.message}`)
    return false
  }

  return true
}
