/* eslint-disable @typescript-eslint/no-var-requires */

import cli from 'cli'

import {
  createDefaultStorageProvider,
  getStorageProvider
} from '@etherealengine/server-core/src/media/storageprovider/storageprovider'

cli.enable('status')

cli.main(async () => {
  try {
    await createDefaultStorageProvider()
    const storageProvider = getStorageProvider()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filesToPrune: any = await storageProvider.listFolderContent('temp', true)
    while (filesToPrune.length) {
      await storageProvider.deleteResources(filesToPrune)
    }
    console.log('Deleted temporary files')
    process.exit(0)
  } catch (err) {
    console.log('Error in deleting temporary files:')
    console.log(err)
    cli.fatal(err)
  }
})
