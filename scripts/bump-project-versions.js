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
const fs = require('fs')
const appRootPath = require('app-root-path')
const cli = require('cli')
const path = require('path')

cli.enable('status')

cli.main(async () => {
  try {
    const serverPackageJSONPath = path.join(appRootPath.path, 'packages/server-core/package.json')
    const defaultProjectJSONPath = path.join(
      appRootPath.path,
      'packages/projects/@etherealengine/default-project/package.json'
    )
    const templateProjectJSONPath = path.join(appRootPath.path, 'packages/projects/template-project/package.json')
    const serverPackageJSON = JSON.parse(fs.readFileSync(serverPackageJSONPath, { encoding: 'utf-8' }))
    const defaultProjectJSON = JSON.parse(fs.readFileSync(defaultProjectJSONPath, { encoding: 'utf-8' }))
    const templateProjectJSON = JSON.parse(fs.readFileSync(templateProjectJSONPath, { encoding: 'utf-8' }))
    if (!defaultProjectJSON.etherealEngine) defaultProjectJSON.etherealEngine = {}
    if (!templateProjectJSON.etherealEngine) templateProjectJSON.etherealEngine = {}
    defaultProjectJSON.etherealEngine.version = serverPackageJSON.version
    templateProjectJSON.etherealEngine.version = serverPackageJSON.version
    fs.writeFileSync(defaultProjectJSONPath, Buffer.from(JSON.stringify(defaultProjectJSON, null, 2)))
    fs.writeFileSync(templateProjectJSONPath, Buffer.from(JSON.stringify(templateProjectJSON, null, 2)))
    console.log('Updated default-project and template-project Ethereal Engine version to', serverPackageJSON.version)
    process.exit(0)
  } catch (err) {
    console.log('Error bumping default-project and template project versions:')
    console.log(err)
    cli.fatal(err)
  }
})
