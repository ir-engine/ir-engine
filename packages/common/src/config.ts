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

/**
 * Config settings (for client and isomorphic engine usage).
 */
const localBuildOrDev =
  globalThis.process.env['APP_ENV'] === 'development' || globalThis.process.env['VITE_LOCAL_BUILD'] === 'true'

export function validateEmail(email: string): boolean {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  return /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone)
}

export const isDev = globalThis.process.env['APP_ENV'] === 'development'

/**
 * Client / frontend
 */
const client = {
  appEnv: globalThis.process.env['APP_ENV'],
  nodeEnv: globalThis.process.env['NODE_ENV'],
  localNginx: globalThis.process.env['VITE_LOCAL_NGINX'],
  localBuild: globalThis.process.env['VITE_LOCAL_BUILD'],
  localBuildOrDev,
  clientUrl:
    localBuildOrDev && globalThis.process.env['VITE_LOCAL_NGINX'] !== 'true'
      ? `https://${globalThis.process.env['VITE_APP_HOST']}:${globalThis.process.env['VITE_APP_PORT']}`
      : `https://${globalThis.process.env['VITE_APP_HOST']}`,
  serverHost: globalThis.process.env['VITE_SERVER_HOST'],
  serverUrl:
    localBuildOrDev && globalThis.process.env['VITE_LOCAL_NGINX'] !== 'true'
      ? `https://${globalThis.process.env['VITE_SERVER_HOST']}:${globalThis.process.env['VITE_SERVER_PORT']}`
      : `https://${globalThis.process.env['VITE_SERVER_HOST']}`,
  instanceserverUrl:
    localBuildOrDev && globalThis.process.env['VITE_LOCAL_NGINX'] !== 'true'
      ? `https://${globalThis.process.env['VITE_INSTANCESERVER_HOST']}:${globalThis.process.env['VITE_INSTANCESERVER_PORT']}`
      : `https://${globalThis.process.env['VITE_INSTANCESERVER_HOST']}`,
  fileServer: globalThis.process.env['VITE_FILE_SERVER'] ?? '',
  mediatorServer: globalThis.process.env['VITE_MEDIATOR_SERVER'],
  cors: {
    proxyUrl:
      localBuildOrDev && globalThis.process.env['VITE_LOCAL_NGINX'] !== 'true'
        ? `https://${process.env['VITE_SERVER_HOST']}:${process.env['VITE_CORS_SERVER_PORT']}`
        : `https://${process.env['VITE_SERVER_HOST']}/cors-proxy`,
    serverPort: globalThis.process.env['VITE_CORS_SERVER_PORT']
  },
  logs: {
    forceClientAggregate: globalThis.process.env['VITE_FORCE_CLIENT_LOG_AGGREGATE'],
    disabled: globalThis.process.env['VITE_DISABLE_LOG']
  },
  rootRedirect: globalThis.process.env['VITE_ROOT_REDIRECT'],
  tosAddress: globalThis.process.env['VITE_TERMS_OF_SERVICE_ADDRESS'],
  readyPlayerMeUrl: globalThis.process.env['VITE_READY_PLAYER_ME_URL'],
  key8thWall: globalThis.process.env['VITE_8TH_WALL']!,
  featherStoreKey: globalThis.process.env['VITE_FEATHERS_STORE_KEY'],
  gaMeasurementId: globalThis.process.env['VITE_GA_MEASUREMENT_ID']
}

/**
 * Full config
 */
export const config = {
  client
}

export default config
