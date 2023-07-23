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
import { spawn } from 'child_process'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import { Sequelize } from 'sequelize'

import { redisSettingPath } from '@etherealengine/engine/src/schemas/setting/redis-setting.schema'

const kubernetesEnabled = process.env.KUBERNETES === 'true'
if (!kubernetesEnabled) {
  dotenv.config({
    path: appRootPath.path,
    silent: true
  })
}

const db = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'etherealengine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql'
} as any

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

cli.enable('status')

const sequelize = new Sequelize({
  ...db,
  logging: console.log,
  define: {
    freezeTableName: true
  }
})

cli.main(async () => {
  await sequelize.sync()

  const [results] = await sequelize.query("SHOW TABLES LIKE 'user';")

  if (results.length === 0) {
    console.log('User table not found, seeding the database...')

    const initPromise = new Promise((resolve) => {
      const initProcess = spawn('npm', ['run', 'init-db-production'])
      initProcess.once('exit', resolve)
      initProcess.once('error', resolve)
      initProcess.once('disconnect', resolve)
      initProcess.stdout.on('data', (data) => console.log(data.toString()))
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

  if (kubernetesEnabled)
    await sequelize.query(
      `UPDATE \`${redisSettingPath}\` SET address='${process.env.REDIS_ADDRESS}',password='${process.env.REDIS_PASSWORD}',port='${process.env.REDIS_PORT}';`
    )

  process.exit(0)
})
