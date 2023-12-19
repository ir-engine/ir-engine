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
const localBuildOrDev = import.meta.env['APP_ENV'] === 'development' || import.meta.env['VITE_LOCAL_BUILD'] === 'true'

export function validateEmail(email: string): boolean {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  return /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone)
}

export const isDev = import.meta.env['APP_ENV'] === 'development'

/**
 * Client / frontend
 */
const client = {
  appEnv: import.meta.env['APP_ENV'],
  nodeEnv: import.meta.env['NODE_ENV'],
  localNginx: import.meta.env['VITE_LOCAL_NGINX'],
  localBuild: import.meta.env['VITE_LOCAL_BUILD'],
  localBuildOrDev,
  clientUrl:
    localBuildOrDev && import.meta.env['VITE_LOCAL_NGINX'] !== 'true'
      ? `https://${import.meta.env['VITE_APP_HOST']}:${import.meta.env['VITE_APP_PORT']}`
      : `https://${import.meta.env['VITE_APP_HOST']}`,
  serverHost: import.meta.env['VITE_SERVER_HOST'],
  serverUrl:
    localBuildOrDev && import.meta.env['VITE_LOCAL_NGINX'] !== 'true'
      ? `https://${import.meta.env['VITE_SERVER_HOST']}:${import.meta.env['VITE_SERVER_PORT']}`
      : `https://${import.meta.env['VITE_SERVER_HOST']}`,
  instanceserverUrl:
    localBuildOrDev && import.meta.env['VITE_LOCAL_NGINX'] !== 'true'
      ? `https://${import.meta.env['VITE_INSTANCESERVER_HOST']}:${import.meta.env['VITE_INSTANCESERVER_PORT']}`
      : `https://${import.meta.env['VITE_INSTANCESERVER_HOST']}`,
  fileServer:
    (import.meta.env['TEST'] === 'true'
      ? import.meta.env['VITE_TEST_FILE_SERVER']
      : import.meta.env['VITE_FILE_SERVER']) ?? 'https://localhost:8642',
  mediatorServer: import.meta.env['VITE_MEDIATOR_SERVER'],
  cors: {
    proxyUrl:
      localBuildOrDev && import.meta.env['VITE_LOCAL_NGINX'] !== 'true'
        ? `https://${import.meta.env['VITE_SERVER_HOST']}:${import.meta.env['VITE_CORS_SERVER_PORT']}`
        : `https://${import.meta.env['VITE_SERVER_HOST']}/cors-proxy`,
    serverPort: import.meta.env['VITE_CORS_SERVER_PORT']
  },
  logs: {
    forceClientAggregate: import.meta.env['VITE_FORCE_CLIENT_LOG_AGGREGATE'],
    disabled: import.meta.env['VITE_DISABLE_LOG']
  },
  rootRedirect: import.meta.env['VITE_ROOT_REDIRECT'],
  tosAddress: import.meta.env['VITE_TERMS_OF_SERVICE_ADDRESS'],
  readyPlayerMeUrl: import.meta.env['VITE_READY_PLAYER_ME_URL'],
  avaturnUrl: import.meta.env['VITE_AVATURN_URL'],
  avaturnAPI: import.meta.env['VITE_AVATURN_API'],
  key8thWall: import.meta.env['VITE_8TH_WALL']!,
  featherStoreKey: import.meta.env['VITE_FEATHERS_STORE_KEY'],
  gaMeasurementId: import.meta.env['VITE_GA_MEASUREMENT_ID']
}

/**
 * Full config
 */
export const config = {
  client
}

export default config
