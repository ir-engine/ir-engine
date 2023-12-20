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

import { Application } from '@feathersjs/koa'

import { exec } from 'child_process'
import mysqldump from 'mysqldump'
import { promisify } from 'util'

export const projectResourcesPath = 'project-resources'

export type CreateProjectResourceParams = {
  project: string
}

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [projectResourcesPath]: any
  }
}

async function createProjectResource({ project }: CreateProjectResourceParams) {
  const tableName = `project_${project.replaceAll('-', '_')}`
  const user = process.env.MYSQL_USER
  const password = process.env.MYSQL_PASSWORD
  const host = process.env.MYSQL_HOST

  const cmdPrefix = `mysql -h ${host} -u ${user} -p"${password}"`

  const dropTableIfExistsCmd = `${cmdPrefix} -e 'USE etherealengine; DROP TABLE IF EXISTS ${tableName};'`
  const createProjectResourceTableCmd = `${cmdPrefix} -e 'USE etherealengine; CREATE TABLE ${tableName} AS SELECT * FROM \`static-resource\` WHERE project = "${project}";'`
  const dropProjectResourceTableCmd = `${cmdPrefix} -e "USE etherealengine; DROP TABLE ${tableName};"`

  const execPromise = promisify(exec)

  function executeCmd(command) {
    return execPromise(command)
      .then(({ stdout }) => {
        console.log(`stdout: ${stdout}`)
      })
      .catch((error) => {
        console.error(`Error: ${error}`)
        throw error // Rethrow the error for upstream catch handling
      })
  }

  await executeCmd(dropTableIfExistsCmd)

  await executeCmd(createProjectResourceTableCmd)

  const connectionConfig = {
    host: 'localhost',
    user: user!,
    password: password!,
    database: 'etherealengine'
  }

  const dumpToFile = `../projects/projects/${project}/resources.sql`

  await mysqldump({
    connection: connectionConfig,
    dump: {
      tables: [tableName]
    },
    dumpToFile
  })

  await executeCmd(dropProjectResourceTableCmd)
}

export default (app: Application): void => {
  app.use(projectResourcesPath, {
    create: createProjectResource
  })
}
