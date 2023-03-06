import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'

import { ServerMode } from '@etherealengine/server-core/declarations'
import { createFeathersExpressApp } from '@etherealengine/server-core/src/createApp'
import { checkProjectAutoUpdate } from '@etherealengine/server-core/src/projects/project/project-helper'

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
  projectName: [false, 'Name of project to update', 'string']
})

cli.main(async () => {
  try {
    const app = createFeathersExpressApp(ServerMode.API)
    await app.setup()
    await checkProjectAutoUpdate(app, options.projectName)
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
