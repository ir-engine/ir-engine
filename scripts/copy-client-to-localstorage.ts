/* eslint-disable @typescript-eslint/no-var-requires */
import appRootPath from 'app-root-path'
import cli from 'cli'
import fs from 'fs'
import path from 'path'

import { copyFolderRecursiveSync, deleteFolderRecursive } from '@etherealengine/server-core/src/util/fsHelperFunctions'

cli.enable('status')

const options = cli.parse({})

cli.main(async () => {
  try {
    deleteFolderRecursive(path.join(appRootPath.path, 'packages/server/upload/client'))
    copyFolderRecursiveSync(
      path.join(appRootPath.path, 'packages/client/dist'),
      path.join(appRootPath.path, 'packages/server/upload')
    )
    fs.renameSync(
      path.join(appRootPath.path, 'packages/server/upload/dist'),
      path.join(appRootPath.path, 'packages/server/upload/client')
    )
    console.log('Copied files to local upload')
    process.exit(0)
  } catch (err) {
    console.log('Error in pushing client images to S3:')
    console.log(err)
    cli.fatal(err)
  }
})
