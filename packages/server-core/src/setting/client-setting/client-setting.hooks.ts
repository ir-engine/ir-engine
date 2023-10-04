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

import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  clientSettingDataValidator,
  clientSettingPatchValidator,
  clientSettingQueryValidator
} from '@etherealengine/engine/src/schemas/setting/client-setting.schema'

import { HookContext } from '@feathersjs/feathers'
import path from 'path'
import logger from '../../ServerLogger'
import config from '../../appconfig'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import { getCacheDomain } from '../../media/storageprovider/getCacheDomain'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { getContentType } from '../../util/fileUtils'
import {
  clientSettingDataResolver,
  clientSettingExternalResolver,
  clientSettingPatchResolver,
  clientSettingQueryResolver,
  clientSettingResolver
} from './client-setting.resolvers'

const updateWebManifest = async (context: HookContext) => {
  const webmanifestPath =
    process.env.SERVE_CLIENT_FROM_STORAGE_PROVIDER === 'true' ? `client/public/site.webmanifest` : 'site.webmanifest'
  const storageProvider = getStorageProvider()
  try {
    const webmanifestResponse = await storageProvider.getObject(webmanifestPath)
    const webmanifest = JSON.parse(webmanifestResponse.Body.toString('utf-8'))
    context.data.startPath = context.data.startPath?.replace(/https:\/\//, '/')
    const icon192px = /https:\/\//.test(context.data.icon192px!)
      ? context.data.icon192px
      : path.join('client', context.data.icon192px!)
    const icon512px = /https:\/\//.test(context.data.icon512px!)
      ? context.data.icon512px
      : path.join('client', context.data.icon512px!)
    webmanifest.name = context.data.title
    webmanifest.short_name = context.data.shortTitle
    webmanifest.start_url =
      config.client.url[config.client.url.length - 1] === '/' && context.data.startPath![0] === '/'
        ? config.client.url + context.data.startPath!.slice(1)
        : config.client.url[config.client.url.length - 1] !== '/' && context.data.startPath![0] !== '/'
        ? config.client.url + '/' + context.data.startPath
        : config.client.url + context.data.startPath
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
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(clientSettingExternalResolver), schemaHooks.resolveResult(clientSettingResolver)]
  },

  before: {
    all: [
      () => schemaHooks.validateQuery(clientSettingQueryValidator),
      schemaHooks.resolveQuery(clientSettingQueryResolver)
    ],
    find: [],
    get: [],
    create: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(clientSettingDataValidator),
      schemaHooks.resolveData(clientSettingDataResolver)
    ],
    update: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write'))
    ],
    patch: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write')),
      () => schemaHooks.validateData(clientSettingPatchValidator),
      schemaHooks.resolveData(clientSettingPatchResolver),
      updateWebManifest
    ],
    remove: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin'), verifyScope('settings', 'write'))
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
