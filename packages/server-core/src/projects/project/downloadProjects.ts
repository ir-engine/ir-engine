/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { getFileKeysRecursive } from '../../media/storageprovider/storageProviderUtils'
import logger from '../../ServerLogger'
import { deleteFolderRecursive, writeFileSyncRecursive } from '../../util/fsHelperFunctions'

/**
 * Downloads a specific project to the local file system from the storage provider cache
 * Then runs `npm install --legacy-peer-deps` inside the project to install it's dependencies
 * @param projectName
 * @param storageProviderName
 * @returns {Promise<boolean>}
 */
export const download = async (projectName: string, storageProviderName?: string) => {
  const storageProvider = getStorageProvider(storageProviderName)
  try {
    logger.info(`[ProjectLoader]: Installing project "${projectName}"...`)
    let files = await getFileKeysRecursive(`projects/${projectName}/`)
    const assetsRegex = new RegExp(`^projects/${projectName}/assets`)
    files = files.filter((file) => !assetsRegex.test(file))
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
        if (fileResult.Body.length === 0) logger.info(`[ProjectLoader]: WARNING file "${filePath}" is empty`)
        writeFileSyncRecursive(path.join(appRootPath.path, 'packages/projects', filePath), fileResult.Body)
      })
    )

    logger.info(`[ProjectLoader]: Successfully downloaded and mounted project "${projectName}".`)
    // if (projectName !== 'default-project') {
    //   const npmInstallPromise = new Promise<void>((resolve) => {
    //     const npmInstallProcess = spawn('npm', ['install', '--legacy-peer-deps'], { cwd: localProjectDirectory })
    //     npmInstallProcess.once('exit', () => {
    //       logger.info('Finished npm installing %s', projectName)
    //       resolve()
    //     })
    //     npmInstallProcess.once('error', resolve)
    //     npmInstallProcess.once('disconnect', resolve)
    //     npmInstallProcess.stdout.on('data', (data) => logger.info(data.toString()))
    //   }).then((result) => logger.info(result))
    //   await Promise.race([
    //     npmInstallPromise,
    //     new Promise<void>((resolve) => {
    //       setTimeout(() => {
    //         logger.warn(`WARNING: npm installing ${projectName} took too long!`)
    //         resolve()
    //       }, 5 * 60 * 1000) // timeout after 5 minutes
    //     })
    //   ])
    // }
  } catch (e) {
    const errorMsg = `[ProjectLoader]: Failed to download project ${projectName} with error: ${e.message}`
    logger.error(e, errorMsg)
    throw e
  }

  return true
}
