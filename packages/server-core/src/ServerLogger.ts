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

// This must always be imported first
import './patchEngineNode'

/**
 * A server-side only multi-stream logger.
 * For isomorphic or client-side logging, use packages/common/src/logger.ts
 * (which will send all log events to this server-side logger here, via an
 *  API endpoint).
 */
import appRootPath from 'app-root-path'
import dotenv from 'dotenv-flow'
import net from 'net'
import os from 'os'
import path from 'path'
import pino from 'pino'
import pinoElastic from 'pino-elasticsearch'
import pinoOpensearch from 'pino-opensearch'
import pretty from 'pino-pretty'

const kubernetesEnabled = process.env.KUBERNETES === 'true'

if (!kubernetesEnabled) {
  dotenv.config({
    path: appRootPath.path,
    node_env: 'local'
  })
}

const node = process.env.ELASTIC_HOST || 'http://localhost:9200'
const nodeOpensearch = process.env.OPENSEARCH_HOST || 'http://localhost:9200'
const useLogger = process.env.DISABLE_SERVER_LOG !== 'true'

const logStashAddress = process.env.LOGSTASH_ADDRESS || 'logstash-service'
const logStashPort = process.env.LOGSTASH_PORT || 5044

const isLogStashRunning = () => {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket()

    const timer = setTimeout(() => {
      reject(new Error(`Timeout trying to connect to logstash ${logStashAddress}:${logStashPort}`))
      socket.destroy()
    }, 10000)

    // Connect to the port
    socket.connect(parseInt(logStashPort.toString()), logStashAddress, () => {
      clearTimeout(timer)
      socket.end()
      resolve(true)
    })

    // Handle connection errors
    socket.on('error', (err: any) => {
      clearTimeout(timer)
      reject(err)
    })
  })
}

const streamToPretty = pretty({
  colorize: true
})

const streamToFile = pino.transport({
  target: 'pino/file',
  options: {
    mkdir: true,
    destination: path.join(appRootPath.path, 'logs/irengine.log')
  }
})

/**
 * https://getpino.io/#/docs/transports?id=logstash
 * https://www.npmjs.com/package/pino-socket
 */
const streamToLogstash = pino.transport({
  target: 'pino-socket',
  options: {
    address: logStashAddress,
    port: logStashPort,
    mode: 'tcp'
  }
})

const streamToOpenSearch = pinoOpensearch({
  index: 'ethereal',
  consistency: 'one',
  node: nodeOpensearch,
  auth: {
    username: process.env.OPENSEARCH_USER || 'admin',
    password: process.env.OPENSEARCH_PASSWORD || 'admin'
  },
  'es-version': 7,
  'flush-bytes': 1000
})

const streamToElastic = pinoElastic({
  index: 'xr-engine',
  node: node,
  esVersion: 7,
  flushBytes: 1000
})

export const opensearchOnlyLogger = pino(
  {
    level: 'debug',
    enabled: useLogger,
    base: {
      hostname: os.hostname,
      component: 'server-core'
    }
  },
  streamToOpenSearch
)

export const elasticOnlyLogger = pino(
  {
    level: 'debug',
    enabled: useLogger,
    base: {
      hostname: os.hostname,
      component: 'server-core'
    }
  },
  streamToElastic
)

const defaultStreams = [streamToPretty, streamToElastic, streamToOpenSearch]

// Enable log to local file
if (process.env.LOG_TO_FILE === 'true') {
  defaultStreams.unshift(streamToFile)
}

const multiStream = pino.multistream(defaultStreams)

export const logger = pino(
  {
    level: 'debug',
    enabled: useLogger,
    base: {
      hostname: os.hostname
    },
    hooks: {
      logMethod(inputArgs, method, level) {
        const pushOrUnshift = (pairs: { [key: string]: string }) => {
          if (inputArgs.length > 0 && typeof inputArgs[0] === 'string') {
            inputArgs.unshift(pairs)
          } else if (inputArgs.length > 0 && typeof inputArgs[0] !== 'string') {
            for (const key in pairs) {
              if (!(inputArgs[0] as any)[key]) {
                ;(inputArgs[0] as any)[key] = pairs[key]
              }
            }
          }
        }

        const defaultPairs = {
          component: 'server-core'
        }
        const defaultProperties = Object.keys(defaultPairs)

        const bindingPairs = this.bindings()
        const bindingProperties = Object.keys(bindingPairs)
        const bindingHasDefaultProps = bindingProperties.some(
          (item) => defaultProperties.includes(item) && bindingPairs[item]
        )

        const inputPairs = inputArgs.length > 0 && typeof inputArgs[0] !== 'string' ? inputArgs[0] : {}
        const inputProperties = Object.keys(inputPairs)
        const inputHasDefaultProps = inputProperties.some(
          (item) => defaultProperties.includes(item) && inputPairs[item]
        )

        if (!bindingHasDefaultProps && !inputHasDefaultProps) {
          pushOrUnshift(defaultPairs)
        } else {
          const pairsToAdd = {}

          for (const key of defaultProperties) {
            const existsInBinding = bindingProperties.includes(key) && bindingPairs[key]
            const existsInInput = inputProperties.includes(key) && inputPairs[key]

            if (!existsInBinding && !existsInInput) {
              pairsToAdd[key] = defaultPairs[key]
            }
          }

          if (Object.keys(pairsToAdd).length > 0) {
            pushOrUnshift(pairsToAdd)
          }
        }

        return method.apply(this, inputArgs)
      }
    }
  },
  multiStream
)

isLogStashRunning()
  .then(() => {
    console.info(`Logstash is running on ${logStashAddress}:${logStashPort}`)
    multiStream.add(streamToLogstash)
  })
  .catch((err) => {
    console.error(`Logstash Connection Error: ${err} when connecting to ${logStashAddress}:${logStashPort}`)
  })

logger.debug('Debug message for testing')

export default logger
