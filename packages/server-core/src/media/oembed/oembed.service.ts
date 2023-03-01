import { BadRequest } from '@feathersjs/errors'
import { Params } from '@feathersjs/feathers'
import { Paginated } from '@feathersjs/feathers/lib'

import { ClientSetting } from '@etherealengine/common/src/interfaces/ClientSetting'
import { OEmbed } from '@etherealengine/common/src/interfaces/OEmbed'
import { ServerSetting } from '@etherealengine/common/src/interfaces/ServerSetting'

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
      const serverSettingsResult = (await app.service('server-setting').find()) as Paginated<ServerSetting>
      const clientSettingsResult = (await app.service('client-setting').find()) as Paginated<ClientSetting>

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

        const activeRoutes = await app.service('route').find()
        const uniqueProjects = [...new Set<string>(activeRoutes.data.map((item) => item.project))]

        for (const projectName of uniqueProjects) {
          const projectConfig = await getProjectConfig(projectName)
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
