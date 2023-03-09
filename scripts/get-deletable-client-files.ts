/* eslint-disable @typescript-eslint/no-var-requires */

import cli from 'cli'
import fs from 'fs'

import {
  createDefaultStorageProvider,
  getStorageProvider
} from '@etherealengine/server-core/src/media/storageprovider/storageprovider'

const UNIQUIFIED_FILE_NAME_REGEX = /\.[a-zA-Z0-9]{8}$/

cli.enable('status')

cli.main(async () => {
  try {
    await createDefaultStorageProvider()
    const storageProvider = getStorageProvider()
    let files = await storageProvider.listFolderContent('client', true)
    files = files.filter((file) => UNIQUIFIED_FILE_NAME_REGEX.test(file.name))
    const putData = {
      Body: Buffer.from(JSON.stringify(files.map((file) => file.key))),
      ContentType: 'application/json',
      Key: 'client/S3FilesToRemove.json'
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
