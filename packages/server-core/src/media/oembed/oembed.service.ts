import { BadRequest } from '@feathersjs/errors'
import { Params } from '@feathersjs/feathers'
import { Paginated } from '@feathersjs/feathers/lib'

import { ClientSetting } from '@xrengine/common/src/interfaces/ClientSetting'
import { Location } from '@xrengine/common/src/interfaces/Location'
import { ServerSetting } from '@xrengine/common/src/interfaces/ServerSetting'

import { Application } from '../../../declarations'
import { getStorageProvider } from '../storageprovider/storageprovider'
import hooks from './oembed.hooks'

declare module '@xrengine/common/declarations' {
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
      const isLocation = /^\/location\//.test(url.pathname)
      const serverSettingsResult = (await app.service('server-setting').find()) as Paginated<ServerSetting>
      const clientSettingsResult = (await app.service('client-setting').find()) as Paginated<ClientSetting>
      if (serverSettingsResult.total > 0 && clientSettingsResult.total > 0) {
        const serverSettings = serverSettingsResult.data[0]
        const clientSettings = clientSettingsResult.data[0]
        if (serverSettings.clientHost !== url.origin.replace(/https:\/\//, ''))
          return new BadRequest('OEmbed request was for a different domain')
        const returned = {
          version: '1.0',
          type: isLocation ? 'photo' : 'link',
          title: `${clientSettings.title} - ${clientSettings.url.replace(/https:\/\//, '')}`,
          provider_name: `${clientSettings.title}`,
          provider_url: `${clientSettings.url}`,
          thumbnail_url:
            clientSettings.favicon32px[0] === '/'
              ? `${clientSettings.url}${clientSettings.favicon32px}`
              : clientSettings.favicon32px,
          thumbnail_width: 32,
          thumbnail_height: 32
        } as any

        if (isLocation) {
          const locationName = url.pathname.replace(/\/location\//, '')
          const locationResult = (await app.service('location').find({
            query: {
              slugifiedName: locationName
            }
          })) as Paginated<Location>
          if (locationResult.total === 0) throw new BadRequest('Invalid location name')
          const [projectName, sceneName] = locationResult.data[0].sceneId.split('/')
          const storageProvider = getStorageProvider()
          returned.url = `https://${storageProvider.cacheDomain}/projects/${projectName}/${sceneName}.thumbnail.jpeg`
          returned.height = 320
          returned.width = 512
        }
        return returned
      }
    }
  })
  const service = app.service('oembed')

  ;(service as any).hooks(hooks)
}
