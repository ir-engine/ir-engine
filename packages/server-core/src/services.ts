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
import fs from 'fs'
import path from 'path'

import { ProjectConfigInterface } from '@ir-engine/projects/ProjectConfigInterface'

import { Application } from '../declarations'
import AnalyticsServices from './analytics/services'
import AssetServices from './assets/services'
import BotService from './bot/services'
import ClusterServices from './cluster/services'
import IntegrationServices from './integrations/services'
import MatchMakingServices from './matchmaking/services'
import MediaServices from './media/services'
import NetworkingServices from './networking/services'
import EntityServices from './projects/services'
import RecordingServices from './recording/services'
import RouteService from './route/service'
import ScopeService from './scope/service'
import SettingService from './setting/service'
import SocialServices from './social/services'
import UserServices from './user/services'
import WorldServices from './world/services'

const installedProjects = fs.existsSync(path.resolve(appRootPath.path, 'packages/projects/projects'))
  ? async () => {
      const projects = fs
        .readdirSync(path.resolve(appRootPath.path, 'packages/projects/projects'), { withFileTypes: true })
        .filter((orgDir) => orgDir.isDirectory())
        .map((orgDir) => {
          return fs
            .readdirSync(path.resolve(appRootPath.path, 'packages/projects/projects', orgDir.name), {
              withFileTypes: true
            })
            .filter((projectDir) => projectDir.isDirectory())
            .map((projectDir) => `${orgDir.name}/${projectDir.name}`)
        })
        .flat()
      const servicesDirs = (
        await Promise.all(
          projects.map(async (projectName) => {
            try {
              const configPath = `../../projects/projects/${projectName}/xrengine.config.ts`
              let config: ProjectConfigInterface = (await import(configPath)).default
              if (!config.services) return null
              return path.join(projectName, config.services as string)
            } catch (e) {
              console.log(e)
            }
          })
        )
      ).filter((hasServices) => !!hasServices)

      return (
        await Promise.all(
          servicesDirs.map(
            async (servicesDir) =>
              (await import(`../../projects/projects/${servicesDir}`)).default as (app: Application) => void
          )
        )
      ).flat()
    }
  : async () => []

const services = [
  ...ClusterServices,
  ...AnalyticsServices,
  ...UserServices,
  ...AssetServices,
  ...MediaServices,
  ...EntityServices,
  ...NetworkingServices,
  ...SocialServices,
  ...BotService,
  ...ScopeService,
  ...SettingService,
  ...RouteService,
  ...RecordingServices,
  ...MatchMakingServices,
  ...WorldServices,
  ...IntegrationServices
]

export default (app: Application) => {
  services.forEach((service) => app.configure(service))
  installedProjects().then((projects) => projects.forEach((service) => app.configure(service)))
}
