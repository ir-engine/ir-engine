import appRootPath from 'app-root-path'
import cli from 'cli'
import fs from 'fs'
import fetch from 'node-fetch'

import { writeFileSyncRecursive } from '@xrengine/server-core/src/util/fsHelperFunctions'

const envPath = appRootPath.path + `/packages/client/public/.wellknown/assetlinks.json`

cli.main(async () => {
  function readStreamFirstData(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
      stream.once('readable', () => {
        const chunk = stream.read()
        resolve(chunk.toString())
      })
      stream.once('error', reject)
    })
  }

  const response = await fetch(process.env.TWA_LINK!)
  if (fs.existsSync(envPath)) fs.rmSync(envPath)

  const data = await readStreamFirstData(response.body!)
  writeFileSyncRecursive(envPath, data)

  process.exit(0)
})
