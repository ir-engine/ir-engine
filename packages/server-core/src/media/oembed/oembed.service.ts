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

import { BadRequest } from '@feathersjs/errors'
import { Params } from '@feathersjs/feathers'
import { Paginated } from '@feathersjs/feathers/lib'

import { OEmbed } from '@etherealengine/common/src/interfaces/OEmbed'
import { routePath } from '@etherealengine/engine/src/schemas/route/route.schema'
import { clientSettingPath, ClientSettingType } from '@etherealengine/engine/src/schemas/setting/client-setting.schema'
import { serverSettingPath, ServerSettingType } from '@etherealengine/engine/src/schemas/setting/server-setting.schema'

import { Application } from '../../../declarations'
import { getProjectConfig, onProjectEvent } from '../../projects/project/project-helper'
import hooks from './oembed.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    oembed: any
  }
}

export default (app: Application): void => {
  app.use('oembed', {
    find: async (params: Params) => {
      const queryURL = params.query?.url
      if (!queryURL) return new BadRequest('Must provide a valid URL for OEmbed')

      const url = new URL(queryURL)
      const serverSettingsResult = (await app.service(serverSettingPath).find()) as Paginated<ServerSettingType>
      const clientSettingsResult = (await app.service(clientSettingPath).find()) as Paginated<ClientSettingType>

      if (serverSettingsResult.total > 0 && clientSettingsResult.total > 0) {
        const serverSettings = serverSettingsResult.data[0]
        const clientSettings = clientSettingsResult.data[0]
        if (serverSettings.clientHost !== url.origin.replace(/https:\/\//, ''))
          return new BadRequest('OEmbed request was for a different domain')

        const currentOEmbedResponse = {
          version: '1.0',
          type: 'link',
          title: `${clientSettings.title} - ${clientSettings.url.replace(/https:\/\//, '')}`,
          description: clientSettings.appDescription,
          provider_name: `${clientSettings.title}`,
          provider_url: `${clientSettings.url}`,
          thumbnail_url:
            clientSettings.favicon32px[0] === '/'
              ? `${clientSettings.url}${clientSettings.favicon32px}`
              : clientSettings.favicon32px,
          thumbnail_width: 32,
          thumbnail_height: 32,
          query_url: queryURL
        } as OEmbed

        const activeRoutes = await app.service(routePath).find({ paginate: false })
        const uniqueProjects = [...new Set<string>(activeRoutes.map((item) => item.project))]

        for (const projectName of uniqueProjects) {
          const projectConfig = getProjectConfig(projectName)
          if (projectConfig?.onEvent) {
            const oEmbedResponse: OEmbed | null = await onProjectEvent(
              app,
              projectName,
              projectConfig.onEvent,
              'onOEmbedRequest',
              url,
              currentOEmbedResponse
            )
            if (oEmbedResponse) {
              return oEmbedResponse
            }
          }
        }

        return currentOEmbedResponse
      }
    }
  })
  const service = app.service('oembed')

  ;(service as any).hooks(hooks)
}
