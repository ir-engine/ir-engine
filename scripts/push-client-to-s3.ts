/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

/* eslint-disable @typescript-eslint/no-var-requires */

import appRootPath from 'app-root-path'
import cli from 'cli'
import fs from 'fs'
import path from 'path'

import { cleanFileNameString } from '@ir-engine/common/src/utils/cleanFileName'
import { getFilesRecursive } from '@ir-engine/common/src/utils/fsHelperFunctions'
import logger from '@ir-engine/server-core/src/ServerLogger'
import {
  createDefaultStorageProvider,
  getStorageProvider
} from '@ir-engine/server-core/src/media/storageprovider/storageprovider'
import { getContentType } from '@ir-engine/server-core/src/util/fileUtils'

cli.enable('status')

cli.main(async () => {
  try {
    await createDefaultStorageProvider()
    const storageProvider = getStorageProvider()
    const clientPath = path.resolve(appRootPath.path, `packages/client/dist`)
    const files = getFilesRecursive(clientPath)
    let filesToPruneResponse = await storageProvider.getObject('client/S3FilesToRemoveInitial.json')
    const filesToPush: string[] = []
    await Promise.all(
      files.map((file) => {
        return new Promise(async (resolve) => {
          try {
            const fileResult = fs.readFileSync(file)
            let filePathRelative = cleanFileNameString(file.slice(clientPath.length), true)
            let contentType = getContentType(file)
            const putData: any = {
              Body: fileResult,
              ContentType: contentType,
              Key: path.join('client', filePathRelative),
              Metadata: {
                'Cache-Control': 'no-cache'
              }
            } as any
            if (/.br$/.exec(filePathRelative)) {
              filePathRelative = filePathRelative.replace(/.br$/, '')
              putData.ContentType = getContentType(filePathRelative)
              putData.ContentEncoding = 'br'
              putData.Key = path.join('client', filePathRelative)
              putData.Metadata = {
                'Cache-Control': 'no-cache'
              }
            }
            await storageProvider.putObject(putData, { isDirectory: false })
            filesToPush.push(path.join('client', filePathRelative))
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
      Key: 'client/S3FilesToRemoveFinal.json',
      Metadata: {
        'Cache-Control': 'no-cache'
      }
    }
    await storageProvider.putObject(putData, { isDirectory: false })
    await storageProvider.createInvalidation(['client/*'])
    console.log('Pushed filtered list of files to remove to S3')
    process.exit(0)
  } catch (err) {
    console.log('Error in pushing client images to S3:')
    console.log(err)
    cli.fatal(err)
  }
})
