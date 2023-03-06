/* eslint-disable @typescript-eslint/no-var-requires */

import cli from 'cli'
import fs from 'fs'

import {
  createDefaultStorageProvider,
  getStorageProvider
} from '@etherealengine/server-core/src/media/storageprovider/storageprovider'

cli.enable('status')

cli.main(async () => {
  try {
    await createDefaultStorageProvider()
    const storageProvider = getStorageProvider()
    let filesToPruneResponse = await storageProvider.getObject('client/S3FilesToRemove.json')
    let filesToPrune = JSON.parse(filesToPruneResponse.Body.toString('utf-8'))
    while (filesToPrune.length > 0) {
      const toDelete = filesToPrune.splice(0, 1000)
      await storageProvider.deleteResources(toDelete)
    }
    console.log('Deleted old S3 files')
    process.exit(0)
  } catch (err) {
    console.log('Error in deleting old S3 client files:')
    console.log(err)
    cli.fatal(err)
  }
})
