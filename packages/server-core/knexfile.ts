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

import appRootPath from 'app-root-path'
import fs from 'fs'
import type { Knex } from 'knex'
import path from 'path'

import appConfig from '@etherealengine/server-core/src/appconfig'

const migrationsDirectories: string[] = []

const parseDirectory = (directoryPath: string) => {
  const directoryContent = fs.readdirSync(directoryPath, { withFileTypes: true }).filter((dir) => dir.isDirectory())
  for (const directory of directoryContent) {
    const subFolder = path.join(directoryPath, directory.name)
    if (directory.name === 'migrations') {
      migrationsDirectories.push(subFolder)
    } else {
      parseDirectory(subFolder)
    }
  }
}

const currentDirectory = process.cwd()
const currentFolderName = path.basename(path.resolve(process.cwd())) // https://stackoverflow.com/a/53295230/2077741

let serverCoreSrc = '../server-core/src'

if (currentFolderName === 'server-core') {
  serverCoreSrc = './src'
} else if (currentDirectory.includes('projects/projects')) {
  serverCoreSrc = '../../../server-core/src'
} else {
  serverCoreSrc = path.join(appRootPath.path, '/packages/server-core/src')
}

parseDirectory(serverCoreSrc)

const projectsDirectory = '../projects/projects'
const projectsExists = fs.existsSync(projectsDirectory)

if (projectsExists) {
  parseDirectory(projectsDirectory)
}

const config: Knex.Config = {
  client: 'mysql',
  connection: appConfig.db.url,
  migrations: {
    directory: migrationsDirectories,
    tableName: 'knex_migrations',
    stub: 'migration.stub',
    extension: 'ts',
    disableMigrationsListValidation: true
  },
  pool: {
    min: 5,
    max: 30
  }
}

// const config: Knex.Config = {
//     client: "sqlite3",
//     connection: {
//       filename: "./dev.sqlite3"
//     }
// }

module.exports = config
