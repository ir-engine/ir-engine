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

import { UNIQUEIFIED_VITE_KEY_REGEX } from '@ir-engine/common/src/regex'
import cli from 'cli'

import {
  createDefaultStorageProvider,
  getStorageProvider
} from '@ir-engine/server-core/src/media/storageprovider/storageprovider'

cli.enable('status')

cli.main(async () => {
  try {
    await createDefaultStorageProvider()
    const storageProvider = getStorageProvider()
    let files = await storageProvider.listFolderContent('client/assets', true)
    files = files.filter((file) => UNIQUEIFIED_VITE_KEY_REGEX.test(file.key))
    const putData = {
      Body: Buffer.from(JSON.stringify(files.map((file) => file.key))),
      ContentType: 'application/json',
      Key: 'client/S3FilesToRemoveInitial.json'
    }
    await storageProvider.putObject(putData, { isDirectory: false })
    console.log('Created list of S3 files to delete after deployment')
    process.exit(0)
  } catch (err) {
    console.log('Error in getting deletable S3 client files:')
    console.log(err)
    cli.fatal(err)
  }
})
