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
