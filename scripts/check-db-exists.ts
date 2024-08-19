/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import appRootPath from 'app-root-path'
import { spawn } from 'child_process'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import knex from 'knex'

import { redisSettingPath } from '@ir-engine/common/src/schema.type.module'

const kubernetesEnabled = process.env.KUBERNETES === 'true'
if (!kubernetesEnabled) {
  dotenv.config({
    path: appRootPath.path,
    silent: true
  })
}

cli.enable('status')

const knexClient = knex({
  client: 'mysql',
  connection: {
    user: process.env.MYSQL_USER ?? 'server',
    password: process.env.MYSQL_PASSWORD ?? 'password',
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    database: process.env.MYSQL_DATABASE ?? 'ir-engine',
    charset: 'utf8mb4'
  }
})

cli.main(async () => {
  const [results] = await knexClient.raw("SHOW TABLES LIKE 'user';")

  if (results.length === 0 || process.env.BUILDER_FORCE_DB_REFRESH === 'true') {
    console.log('User table not found, seeding the database...')

    const initPromise = new Promise((resolve) => {
      const initProcess = spawn('npm', ['run', 'init-db-production'])
      initProcess.once('exit', resolve)
      initProcess.once('error', resolve)
      initProcess.once('disconnect', resolve)
      initProcess.stdout.on('data', (data) => console.log(data.toString()))
      initProcess.stderr.on('data', (data) => console.error(data.toString()))
    }).then(console.log)

    await Promise.race([
      initPromise,
      new Promise<void>((resolve) => {
        setTimeout(
          () => {
            console.log('WARNING: Initialisation too long to launch!')
            resolve()
          },
          5 * 60 * 1000
        ) // timeout after 5 minutes - it needs to be this long as the default project is uploaded to the storage provider in this time
      })
    ])
  } else {
    console.log('Database found')
  }

  if (kubernetesEnabled) {
    const [results2] = await knexClient.raw(`SHOW TABLES LIKE '${redisSettingPath}';`)
    if (results2.length > 0)
      await knexClient.raw(
        `UPDATE \`${redisSettingPath}\`
           SET address='${process.env.REDIS_ADDRESS}',
               password='${process.env.REDIS_PASSWORD}',
               port='${process.env.REDIS_PORT}';`
      )
  }

  process.exit(0)
})
