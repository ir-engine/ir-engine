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
import knex from 'knex'

import { buildStatusPath, BuildStatusType } from '@etherealengine/engine/src/schemas/cluster/build-status.schema'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

cli.enable('status')

const options = cli.parse({
  service: [false, 'Name of failing service', 'string'],
  isDocker: [false, 'Whether or not this is checking logs files for a Docker process.', 'boolean']
})

cli.main(async () => {
  try {
    const knexClient = knex({
      client: 'mysql',
      connection: {
        user: process.env.MYSQL_USER ?? 'server',
        password: process.env.MYSQL_PASSWORD ?? 'password',
        host: process.env.MYSQL_HOST ?? '127.0.0.1',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        database: process.env.MYSQL_DATABASE ?? 'etherealengine',
        charset: 'utf8mb4'
      }
    })

    const dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ')

    const buildLogs = fs.readFileSync(`${options.service}-build-logs.txt`).toString()
    const buildErrors = fs.readFileSync(`${options.service}-build-error.txt`).toString()
    const builderRun = fs.readFileSync('builder-run.txt').toString()
    if (options.isDocker) {
      const cacheMissRegex = new RegExp(`${options.service}:latest_${process.env.RELEASE_NAME}: not found`)
      if (/ERROR:/.test(buildErrors) && !cacheMissRegex.test(buildErrors)) {
        const combinedLogs = `Docker task that errored: ${options.service}\n\nTask logs:\n\n${buildErrors}`
        await knexClient
          .from<BuildStatusType>(buildStatusPath)
          .where({
            id: parseInt(builderRun)
          })
          .update({
            status: 'failed',
            logs: combinedLogs,
            dateEnded: dateNow
          })
        cli.exit(1)
      } else cli.exit(0)
    } else {
      if (/error/i.test(buildErrors) || /fail/i.test(buildErrors)) {
        const combinedLogs = `Task that errored: ${options.service}\n\nError logs:\n\n${buildErrors}\n\nTask logs:\n\n${buildLogs}`
        await knexClient
          .from<BuildStatusType>(buildStatusPath)
          .where({
            id: parseInt(builderRun)
          })
          .update({
            status: 'failed',
            logs: combinedLogs,
            dateEnded: dateNow
          })
        cli.exit(1)
      } else cli.exit(0)
    }
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
