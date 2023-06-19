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
 * A server-side only multi-stream logger.
 * For isomorphic or client-side logging, use packages/common/src/logger.ts
 * (which will send all log events to this server-side logger here, via an
 *  API endpoint).
 */
import os from 'os'
import pino from 'pino'
import pinoElastic from 'pino-elasticsearch'
import pretty from 'pino-pretty'

const node = process.env.ELASTIC_HOST || 'http://localhost:9200'
const useLogger = !process.env.DISABLE_SERVER_LOG

const streamToPretty = pretty({
  colorize: true
})

const streamToElastic = pinoElastic({
  index: 'xr-engine',
  consistency: 'one',
  node: node,
  'es-version': 7,
  'flush-bytes': 1000
})

const streams = [streamToPretty, streamToElastic]

export const logger = pino(
  {
    level: 'debug',
    enable: useLogger,
    base: {
      hostname: os.hostname,
      component: 'server-core'
    }
  },
  pino.multistream(streams)
)

export const elasticOnlyLogger = pino(
  {
    level: 'debug',
    enable: useLogger,
    base: {
      hostname: os.hostname,
      component: 'server-core'
    }
  },
  streamToElastic
)

export default logger
