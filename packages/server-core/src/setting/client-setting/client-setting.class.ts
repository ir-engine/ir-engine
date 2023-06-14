import { Id, PaginationOptions, Params } from '@feathersjs/feathers'
import { KnexAdapter } from '@feathersjs/knex'
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex'
import path from 'path'

import {
  ClientSettingData,
  ClientSettingPatch,
  ClientSettingQuery,
  ClientSettingType
} from '@etherealengine/engine/src/schemas/setting/client-setting.schema'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { getCacheDomain } from '../../media/storageprovider/getCacheDomain'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import logger from '../../ServerLogger'
import { getContentType } from '../../util/fileUtils'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ClientSettingParams extends KnexAdapterParams<ClientSettingQuery> {}

/**
 * A class for ClientSetting service
 */

export class ClientSettingService<
  T = ClientSettingType,
  ServiceParams extends Params = ClientSettingParams
> extends KnexAdapter<ClientSettingType, ClientSettingData, ClientSettingParams, ClientSettingPatch> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async find(
    params?: ClientSettingParams & {
      paginate?: PaginationOptions | false
    }
  ) {
    return super._find(params)
  }

  async get(id: Id, params?: ClientSettingParams) {
    return super._get(id, params)
  }

  async create(data: ClientSettingData, params?: ClientSettingParams) {
    return super._create(data, params)
  }

  async patch(id: Id, data: ClientSettingPatch, params?: ClientSettingParams) {
    const webmanifestPath =
      process.env.SERVE_CLIENT_FROM_STORAGE_PROVIDER === 'true' ? `client/public/site.webmanifest` : 'site.webmanifest'
    const storageProvider = getStorageProvider()
    try {
      const webmanifestResponse = await storageProvider.getObject(webmanifestPath)
      const webmanifest = JSON.parse(webmanifestResponse.Body.toString('utf-8'))
      data.startPath = data.startPath?.replace(/https:\/\//, '/')
      const icon192px = /https:\/\//.test(data.icon192px!) ? data.icon192px : path.join('client', data.icon192px!)
      const icon512px = /https:\/\//.test(data.icon512px!) ? data.icon512px : path.join('client', data.icon512px!)
      webmanifest.name = data.title
      webmanifest.short_name = data.shortTitle
      webmanifest.start_url =
        config.client.url[config.client.url.length - 1] === '/' && data.startPath![0] === '/'
          ? config.client.url + data.startPath!.slice(1)
          : config.client.url[config.client.url.length - 1] !== '/' && data.startPath![0] !== '/'
          ? config.client.url + '/' + data.startPath
          : config.client.url + data.startPath
      const cacheDomain = getCacheDomain(storageProvider)
      webmanifest.icons = [
        {
          src: /https:\/\//.test(icon192px!)
            ? icon192px
            : cacheDomain[cacheDomain.length - 1] === '/' && icon192px![0] === '/'
            ? `https://${cacheDomain}${icon192px?.slice(1)}`
            : cacheDomain[cacheDomain.length - 1] !== '/' && icon192px![0] !== '/'
            ? `https://${cacheDomain}/${icon192px}`
            : `https://${cacheDomain}${icon192px}`,
          sizes: '192x192',
          type: getContentType(icon192px!)
        },
        {
          src: /https:\/\//.test(icon512px!)
            ? icon512px
            : cacheDomain[cacheDomain.length - 1] === '/' && icon512px![0] === '/'
            ? `https://${cacheDomain}${icon512px?.slice(1)}`
            : cacheDomain[cacheDomain.length - 1] !== '/' && icon512px![0] !== '/'
            ? `https://${cacheDomain}/${icon512px}`
            : `https://${cacheDomain}${icon512px}`,
          sizes: '512x512',
          type: getContentType(icon512px!)
        }
      ]
      await storageProvider.createInvalidation([webmanifestPath])
      await storageProvider.putObject({
        Body: Buffer.from(JSON.stringify(webmanifest)),
        ContentType: 'application/manifest+json',
        Key: 'client/public/site.webmanifest'
      })
    } catch (err) {
      logger.info('Error with manifest update', webmanifestPath)
      logger.error(err)
    }

    return super._patch(id, data, params)
  }
}
