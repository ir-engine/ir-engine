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

cli.main(async () => {
  try {
    await createDefaultStorageProvider()
    const storageProvider = getStorageProvider()
    const clientPath = path.resolve(appRootPath.path, `packages/client/dist`)
    const files = getFilesRecursive(clientPath)
    let filesToPruneResponse = await storageProvider.getObject('client/S3FilesToRemove.json')
    const filesToPush: string[] = []
    await Promise.all(
      files.map((file) => {
        return new Promise(async (resolve) => {
          try {
            const fileResult = fs.readFileSync(file)
            let filePathRelative = processFileName(file.slice(clientPath.length))
            let contentType = getContentType(file)
            const putData: any = {
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
            resolve(null)
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
