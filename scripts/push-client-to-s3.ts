/* eslint-disable @typescript-eslint/no-var-requires */

import appRootPath from 'app-root-path'
import cli from 'cli'
import fs from 'fs'
import path from 'path'

import { processFileName } from '@etherealengine/common/src/utils/processFileName'
import {
  createDefaultStorageProvider,
  getStorageProvider
} from '@etherealengine/server-core/src/media/storageprovider/storageprovider'
import logger from '@etherealengine/server-core/src/ServerLogger'
import { getContentType } from '@etherealengine/server-core/src/util/fileUtils'
import { getFilesRecursive } from '@etherealengine/server-core/src/util/fsHelperFunctions'

cli.enable('status')

const options = cli.parse({})

cli.main(async () => {
  try {
    await createDefaultStorageProvider()
    const storageProvider = getStorageProvider()
    const clientPath = path.resolve(appRootPath.path, `packages/client/dist`)
    const files = getFilesRecursive(clientPath)
    let filesToPruneResponse = await storageProvider.getObject('client/S3FilesToRemove.json')
    const filesToPush = []
    await Promise.all(
      files.map((file) => {
        return new Promise(async (resolve) => {
          try {
            const fileResult = fs.readFileSync(file)
            let filePathRelative = processFileName(file.slice(clientPath.length))
            let contentType = getContentType(file)
            const putData = {
              Body: fileResult,
              ContentType: contentType,
              Key: `client${filePathRelative}`
            }
            if (/.br$/.exec(filePathRelative)) {
              filePathRelative = filePathRelative.replace(/.br$/, '')
              putData.ContentType = getContentType(filePathRelative)
              putData.ContentEncoding = 'br'
              putData.Key = `client${filePathRelative}`
            }
            await storageProvider.putObject(putData, { isDirectory: false })
            filesToPush.push(`client${filePathRelative}`)
            resolve()
          } catch (e) {
            logger.error(e)
            resolve(null)
          }
        })
      })
    )
    console.log('Pushed client files to S3')
    let filesToPrune = JSON.parse(filesToPruneResponse.Body.toString('utf-8'))
    filesToPrune = filesToPrune.filter((file) => filesToPush.indexOf(file) < 0)
    const putData = {
      Body: Buffer.from(JSON.stringify(filesToPrune)),
      ContentType: 'application/json',
      Key: 'client/S3FilesToRemove.json'
    }
    await storageProvider.putObject(putData, { isDirectory: false })
    console.log('Pushed filtered list of files to remove to S3')
    process.exit(0)
  } catch (err) {
    console.log('Error in pushing client images to S3:')
    console.log(err)
    cli.fatal(err)
  }
})
