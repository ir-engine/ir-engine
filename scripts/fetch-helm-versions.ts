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
import { exec } from 'child_process'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fs from 'fs'
import knex from 'knex'
import path from 'path'
import { promisify } from 'util'

import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { BUILDER_CHART_REGEX, MAIN_CHART_REGEX } from '@ir-engine/common/src/regex'
import { EngineSettingData, engineSettingPath } from '@ir-engine/common/src/schema.type.module'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

const execAsync = promisify(exec)

cli.enable('status')

const options = cli.parse({
  stage: [true, 'dev, prod, etc; deployment stage', 'string']
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
        database: process.env.MYSQL_DATABASE ?? 'ir-engine',
        charset: 'utf8mb4'
      }
    })

    const helmSettings = await knexClient.select().from<EngineSettingData>(engineSettingPath).where({
      category: 'helm'
    })

    const helmBuilder = helmSettings.find((setting) => setting.key == EngineSettings.Helm.Main)?.value
    const helmMain = helmSettings.find((setting) => setting.key === EngineSettings.Helm.Builder)?.value

    const helmMainVersionName = path.join(appRootPath.path, 'helm-main-version.txt')
    const helmBuilderVersionName = path.join(appRootPath.path, 'helm-builder-version.txt')

    if (helmSettings && helmSettings.length > 0) {
      if (helmMain) fs.writeFileSync(helmMainVersionName, helmMain)
      else {
        const { stdout } = await execAsync(`helm history ${options.stage} | grep deployed`)
        const matches = stdout.matchAll(MAIN_CHART_REGEX)
        for (const match of matches) {
          const mainChartVersion = match[1]
          if (mainChartVersion) {
            fs.writeFileSync(helmMainVersionName, mainChartVersion)
          }
        }
      }
      if (helmBuilder && helmBuilder.length > 0) fs.writeFileSync(helmBuilderVersionName, helmBuilder)
      else {
        const { stdout } = await execAsync(`helm history ${options.stage}-builder | grep deployed`)
        const matches = stdout.matchAll(BUILDER_CHART_REGEX)
        for (const match of matches) {
          const builderChartVersion = match[1]
          if (builderChartVersion) {
            fs.writeFileSync(helmBuilderVersionName, builderChartVersion)
          }
        }
      }
    } else {
      const { stdout } = await execAsync(`helm history ${options.stage} | grep deployed`)

      const mainChartMatches = stdout.matchAll(MAIN_CHART_REGEX)
      for (const match of mainChartMatches) {
        const mainChartVersion = match[1]
        if (mainChartVersion) {
          fs.writeFileSync(helmMainVersionName, mainChartVersion)
        }
      }

      const builderChartMatches = stdout.matchAll(BUILDER_CHART_REGEX)
      for (const match of builderChartMatches) {
        const builderChartVersion = match[1]
        if (builderChartVersion) {
          fs.writeFileSync(helmBuilderVersionName, builderChartVersion)
        }
      }
    }
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})
