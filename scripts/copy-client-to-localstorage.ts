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
import fs, { promises as fsp } from 'fs'
import path from 'path'

import { cpAsync, existsAsync } from '@etherealengine/common/src/utils/fsHelperFunctions'

cli.enable('status')

const options = cli.parse({})

cli.main(async () => {
  try {
    const clientPath = path.join(appRootPath.path, 'packages/server/upload/client')
    if (await existsAsync(clientPath)) await fsp.rm(clientPath, { recursive: true })
    await cpAsync(
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
