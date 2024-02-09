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
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fs from 'fs'
import path from 'path'

import { copyFolderRecursiveSync } from '@etherealengine/common/src/utils/fsHelperFunctions'
import { execPromise } from '@etherealengine/server-core/src/util/execPromise'

const templateFolderDirectory = path.join(appRootPath.path, `packages/projects/template-project/`)
const projectsRootFolder = path.join(appRootPath.path, 'packages/projects/projects/')

dotenv.config({
  path: appRootPath.path,
  silent: true
})

const db = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'etherealengine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql',
  url: ''
}

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

cli.enable('status')

const options = cli.parse({
  name: [false, 'Name of project', 'string'],
  repo: [false, 'URL of repo', 'string']
}) as {
  name?: string
  repo?: string
}

cli.main(async () => {
  try {
    if (!options.name) throw new Error('No project name specified')

    const name = options.name.replace(' ', '-')

    const projectLocalDirectory = path.resolve(projectsRootFolder, name)

    // get if folder exists
    if (fs.existsSync(projectLocalDirectory)) {
      cli.fatal(`Project '${name}' already exists`)
    }

    /** we used to use the project service create method here, but we shouldn't need to */
    copyFolderRecursiveSync(templateFolderDirectory, projectsRootFolder)
    fs.renameSync(path.resolve(projectsRootFolder, 'template-project'), projectLocalDirectory)

    const projectFolder = path.resolve(appRootPath.path, 'packages/projects/projects', name)

    /** Init git */
    await execPromise(`git init`, { cwd: projectFolder })
    await execPromise(`git add .`, { cwd: projectFolder })
    await execPromise(`git commit -m "Initialize project"`, { cwd: projectFolder })

    /** Create main and dev branches */
    await execPromise(`git branch -M main`, { cwd: projectFolder })
    await execPromise(`git checkout -b dev`, { cwd: projectFolder })

    /** Push to remote */
    if (options.repo) {
      await execPromise(`git remote add origin ${options.repo}`, { cwd: projectFolder })
      await execPromise(`git push -u origin dev`, { cwd: projectFolder })
      await execPromise(`git push -u origin main`, { cwd: projectFolder })
    }
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
