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

import cors_proxy from 'cors-anywhere'
import net from 'net'

import config from './appconfig'
import logger from './ServerLogger'

const createCorsServer = (useSSL, certOptions, port) => {
  cors_proxy
    .createServer({
      httpsOptions: useSSL
        ? {
            key: certOptions.key,
            cert: certOptions.cert
          }
        : null,
      originWhitelist: [], // Allow all origins
      requireHeader: [
        /*'origin', 'x-requested-with'*/
      ],
      removeHeaders: ['cookie', 'cookie2']
    })
    .listen(port, function () {
      logger.info('CORS server created with the following options:')
      logger.info('Use SSL: %s', useSSL) // Log a boolean
      logger.info('Port: %d', port)
      logger.info(`Running CORS on port "${port}".`)
    })
}

export const StartCorsServer = (useSSL, certOptions) => {
  const port = config.server.corsServerPort
  isPortTaken(port, () => {
    createCorsServer(useSSL, certOptions, port)
  })
  logger.info('Starting CORS server with the following options.')
  logger.info('Port: %d', port)
}

const isPortTaken = (port, fn) => {
  const tester = net
    .createServer()
    .once('error', (err) => {
      logger.error(err)
    })
    .once('listening', () => {
      tester
        .once('close', () => {
          fn()
        })
        .close()
    })
    .listen(port)
  logger.info(`Port taken "${port}" is taken.`)
}
