import { Id, NullableId, Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import path from 'path'

import { ClientSetting as ClientSettingInterface } from '@etherealengine/common/src/interfaces/ClientSetting'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { getCacheDomain } from '../../media/storageprovider/getCacheDomain'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import logger from '../../ServerLogger'
import { getContentType } from '../../util/fileUtils'

export type ClientSettingDataType = ClientSettingInterface

export class ClientSetting<T = ClientSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: Params): Promise<T[] | Paginated<T>> {
    const clientSettings = (await super.find(params)) as any
    const data = clientSettings.data.map((el) => {
      let appSocialLinks = JSON.parse(el.appSocialLinks)
      let themeSettings = JSON.parse(el.themeSettings)
      let themeModes = JSON.parse(el.themeModes)

      if (typeof appSocialLinks === 'string') appSocialLinks = JSON.parse(appSocialLinks)
      if (typeof themeSettings === 'string') themeSettings = JSON.parse(themeSettings)
      if (typeof themeModes === 'string') themeModes = JSON.parse(themeModes)

      return {
        ...el,
        appSocialLinks: appSocialLinks,
        themeSettings: themeSettings,
        themeModes: themeModes,
        homepageLinkButtonEnabled: el.homepageLinkButtonEnabled === 1
      }
    })

    return {
      total: clientSettings.total,
      limit: clientSettings.limit,
      skip: clientSettings.skip,
      data
    }
  }

  async get(id: Id, params?: Params): Promise<T> {
    const clientSettings = (await super.get(id, params)) as any
    let appSocialLinks = JSON.parse(clientSettings.appSocialLinks)
    let themeSettings = JSON.parse(clientSettings.themeSettings)
    let themeModes = JSON.parse(clientSettings.themeModes)

    if (typeof appSocialLinks === 'string') appSocialLinks = JSON.parse(appSocialLinks)
    if (typeof themeSettings === 'string') themeSettings = JSON.parse(themeSettings)
    if (typeof themeModes === 'string') themeModes = JSON.parse(themeModes)

    return {
      ...clientSettings,
      appSocialLinks: appSocialLinks,
      themeSettings: themeSettings,
      themeModes: themeModes,
      homepageLinkButtonEnabled: clientSettings.homepageLinkButtonEnabled === 1
    }
  }

  async patch(id: NullableId, data: any, params?: Params): Promise<T | T[]> {
    const webmanifestPath =
      process.env.SERVE_CLIENT_FROM_STORAGE_PROVIDER === 'true' ? `client/site.webmanifest` : 'site.webmanifest'
    const storageProvider = getStorageProvider()
    try {
      const webmanifestResponse = await storageProvider.getObject(webmanifestPath)
      const webmanifest = JSON.parse(webmanifestResponse.Body.toString('utf-8'))
      data.startPath = data.startPath.replace(/https:\/\//, '/')
      const icon192px = /https:\/\//.test(data.icon192px) ? data.icon192px : path.join('client', data.icon192px)
      const icon512px = /https:\/\//.test(data.icon512px) ? data.icon512px : path.join('client', data.icon512px)
      webmanifest.name = data.title
      webmanifest.short_name = data.shortTitle
      webmanifest.start_url =
        config.client.url[config.client.url.length - 1] === '/' && data.startPath[0] === '/'
          ? config.client.url + data.startPath.slice(1)
          : config.client.url[config.client.url.length - 1] !== '/' && data.startPath[0] !== '/'
          ? config.client.url + '/' + data.startPath
          : config.client.url + data.startPath
      const cacheDomain = getCacheDomain(storageProvider)
      webmanifest.icons = [
        {
          src: /https:\/\//.test(icon192px)
            ? icon192px
            : cacheDomain[cacheDomain.length - 1] === '/' && icon192px[0] === '/'
            ? `https://${cacheDomain}${icon192px.slice(1)}`
            : cacheDomain[cacheDomain.length - 1] !== '/' && icon192px[0] !== '/'
            ? `https://${cacheDomain}/${icon192px}`
            : `https://${cacheDomain}${icon192px}`,
          sizes: '192x192',
          type: getContentType(icon192px)
        },
        {
          src: /https:\/\//.test(icon512px)
            ? icon512px
            : cacheDomain[cacheDomain.length - 1] === '/' && icon512px[0] === '/'
            ? `https://${cacheDomain}${icon512px.slice(1)}`
            : cacheDomain[cacheDomain.length - 1] !== '/' && icon512px[0] !== '/'
            ? `https://${cacheDomain}/${icon512px}`
            : `https://${cacheDomain}${icon512px}`,
          sizes: '512x512',
          type: getContentType(icon512px)
        }
      ]
      await storageProvider.createInvalidation([webmanifestPath])
      await storageProvider.putObject({
        Body: Buffer.from(JSON.stringify(webmanifest)),
        ContentType: 'application/manifest+json',
        Key: 'client/site.webmanifest'
      })
    } catch (err) {
      logger.info('Error with manifest update', webmanifestPath)
      logger.error(err)
    }
    return super.patch(id, data, params)
  }
}
