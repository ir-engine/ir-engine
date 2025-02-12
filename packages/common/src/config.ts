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

import { EMAIL_REGEX } from './regex'
import type { MediaSettingsType } from './schema.type.module'

/**
 * Config settings (for client and isomorphic engine usage).
 */
const localBuildOrDev = false

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  return /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone)
}

/** @deprecated - use import from @ir-engine/hyperflux instead */
export const isDev = process.env.APP_ENV === 'development'

/**
 * Client / frontend
 */
// TODO: Make sure to expose only public keys to React Native.
const client = {
  appEnv: process.env.APP_ENV,
  nodeEnv: process.env.NODE_ENV,
  localNginx: process.env.VITE_LOCAL_NGINX,
  localBuild: process.env.VITE_LOCAL_BUILD,
  localBuildOrDev,
  clientUrl:
    localBuildOrDev && process.env.VITE_LOCAL_NGINX !== 'true'
      ? `http://${process.env.VITE_APP_HOST}:${process.env.VITE_APP_PORT}`
      : `https://${process.env.VITE_APP_HOST}`,
  serverHost: process.env.VITE_SERVER_HOST,
  rootDomainEnabled: process.env.VITE_ROOT_DOMAIN_ENABLED === 'false' ? false : true, // default to true
  serverUrl:
    localBuildOrDev && process.env.VITE_LOCAL_NGINX !== 'true'
      ? `http://${process.env.VITE_SERVER_HOST}:${process.env.VITE_SERVER_PORT}`
      : `https://${process.env.VITE_SERVER_HOST}`,
  instanceserverUrl:
    localBuildOrDev && process.env.VITE_LOCAL_NGINX !== 'true'
      ? `http://${process.env.VITE_INSTANCESERVER_HOST}:${process.env.VITE_INSTANCESERVER_PORT}`
      : `https://${process.env.VITE_INSTANCESERVER_HOST}`,
  fileServer:
    (process.env.TEST === 'true' ? process.env.VITE_TEST_FILE_SERVER : process.env.VITE_FILE_SERVER) ??
    'http://localhost:8642',
  mediatorServer: process.env.VITE_MEDIATOR_SERVER,
  cors: {
    proxyUrl:
      localBuildOrDev && process.env.VITE_LOCAL_NGINX !== 'true'
        ? `http://${process.env.VITE_SERVER_HOST}:${process.env.VITE_CORS_SERVER_PORT}`
        : `https://${process.env.VITE_SERVER_HOST}/cors-proxy`,
    serverPort: process.env.VITE_CORS_SERVER_PORT
  },
  logs: {
    forceClientAggregate: process.env.VITE_FORCE_CLIENT_LOG_AGGREGATE,
    disabled: process.env.VITE_DISABLE_LOG
  },
  mediaSettings: null! as MediaSettingsType,
  rootRedirect: process.env.VITE_ROOT_REDIRECT,
  tosAddress: process.env.VITE_TERMS_OF_SERVICE_ADDRESS,
  readyPlayerMeUrl: process.env.VITE_READY_PLAYER_ME_URL,
  avaturnUrl: process.env.VITE_AVATURN_URL,
  avaturnAPI: process.env.VITE_AVATURN_API,
  key8thWall: process.env.VITE_8TH_WALL!,
  featherStoreKey: process.env.VITE_FEATHERS_STORE_KEY,
  gaMeasurementId: process.env.VITE_GA_MEASUREMENT_ID,

  zendesk: {
    enabled: process.env.VITE_ZENDESK_ENABLED,
    authenticationEnabled: process.env.VITE_ZENDESK_AUTHENTICATION_ENABLED,
    key: process.env.VITE_ZENDESK_KEY
  },
  maxFileSizeToUpload: process.env.VITE_MAX_FILE_SIZE_TO_UPLOAD_MB
    ? parseInt(process.env.VITE_MAX_FILE_SIZE_TO_UPLOAD_MB, 10) * 1024 * 1024
    : 1000 * 1024 * 1024 // 1000 MB or 1GB
}

/**
 * Full config
 */
export const config = {
  client,
  websocket: {
    pingTimeout: process.env.VITE_WEBSOCKET_PING_TIMEOUT ? parseInt(process.env.VITE_WEBSOCKET_PING_TIMEOUT) : 30000,
    pingInterval: process.env.VITE_WEBSOCKET_PING_INTERVAL ? parseInt(process.env.VITE_WEBSOCKET_PING_INTERVAL) : 10000
  }
}

export default config
